import dns from 'dns';
import net from 'net';
import tls from 'tls';
import crypto from 'crypto';

export interface SovereignOutboundEmail {
  fromAddress: string;
  toAddress: string;
  subject: string;
  body: string;
  senderDomain: string;
  dkimSelector?: string;
  pemPrivateKey?: string;
}

export interface SovereignSmtpResult {
  success: boolean;
  mxHost?: string;
  mxIp?: string;
  dkimSigned: boolean;
  startTlsEstablished: boolean;
  transmissionLog: string[];
  responseCode?: number;
  error?: string;
}

/**
 * SOVEREIGN AUTONOMOUS OUTBOUND SMTP ENGINE (ZERO API DEPENDENCY)
 * Architectural Spec: Direct Socket Transport, Internal DNS MX, DKIM RFC 6376, STARTTLS RFC 3207
 */
export async function sendSovereignSmtpEmail(email: SovereignOutboundEmail): Promise<SovereignSmtpResult> {
  const log: string[] = [];
  const addLog = (msg: string) => {
    log.push(`[${new Date().toISOString()}] ${msg}`);
    console.log(`[SOVEREIGN SMTP] ${msg}`);
  };

  addLog(`Initiating direct socket SMTP delivery to: ${email.toAddress}`);

  const recipientDomain = email.toAddress.split('@')[1];
  if (!recipientDomain) {
    return {
      success: false,
      dkimSigned: false,
      startTlsEstablished: false,
      transmissionLog: log,
      error: 'Invalid recipient email address domain.'
    };
  }

  // Step 1: Direct UDP DNS MX Resolver
  addLog(`Resolving DNS MX records for domain: ${recipientDomain}`);
  let mxHost = '';
  try {
    const mxRecords = await dns.promises.resolveMx(recipientDomain);
    if (!mxRecords || mxRecords.length === 0) {
      throw new Error(`No MX records found for ${recipientDomain}`);
    }
    mxRecords.sort((a, b) => a.priority - b.priority);
    mxHost = mxRecords[0].exchange;
    addLog(`MX Server resolved: ${mxHost} (Priority ${mxRecords[0].priority})`);
  } catch (err: any) {
    addLog(`MX resolution warning: ${err.message}. Falling back to domain direct A lookup.`);
    mxHost = recipientDomain;
  }

  // Resolve IP for MX Host
  let mxIp = '';
  try {
    const ips = await dns.promises.resolve4(mxHost);
    mxIp = ips[0] || mxHost;
    addLog(`Resolved MX Host ${mxHost} to IP: ${mxIp}`);
  } catch (e) {
    mxIp = mxHost;
  }

  // Step 2: Compute DKIM RFC 6376 Signature if private key provided
  let dkimSignatureHeader = '';
  let dkimSigned = false;
  const dkimSelector = email.dkimSelector || 'default';
  const senderDomain = email.senderDomain || email.fromAddress.split('@')[1] || 'uarefake.com';

  // Compute SHA256 body hash
  const bodyHash = crypto.createHash('sha256').update(email.body).digest('base64');

  if (email.pemPrivateKey) {
    try {
      const canonicalHeaders = `from:${email.fromAddress}\r\nto:${email.toAddress}\r\nsubject:${email.subject}\r\ndkim-signature:v=1; a=rsa-sha256; c=relaxed/relaxed; d=${senderDomain}; s=${dkimSelector}; h=from:to:subject; bh=${bodyHash}; b=`;
      
      const signer = crypto.createSign('RSA-SHA256');
      signer.update(canonicalHeaders);
      const signatureB64 = signer.sign(email.pemPrivateKey, 'base64');

      dkimSignatureHeader = `DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=${senderDomain}; s=${dkimSelector};\r\n  h=from:to:subject; bh=${bodyHash};\r\n  b=${signatureB64}\r\n`;
      dkimSigned = true;
      addLog(`Computed RFC 6376 DKIM signature successfully for domain: ${senderDomain}`);
    } catch (dkimErr: any) {
      addLog(`DKIM signing warning: ${dkimErr.message}`);
    }
  }

  // Step 3: Direct Socket Delivery Protocol State Machine (STARTTLS RFC 3207)
  let startTlsEstablished = false;

  return new Promise((resolve) => {
    const socket = new net.Socket();
    let tlsSocket: tls.TLSSocket | null = null;
    let currentStep = 'CONNECT';

    socket.setTimeout(12000);

    const getActiveStream = () => tlsSocket || socket;

    const writeCommand = (cmd: string) => {
      addLog(`CLIENT -> ${cmd.trim()}`);
      getActiveStream().write(cmd + '\r\n');
    };

    const cleanup = () => {
      socket.destroy();
      if (tlsSocket) tlsSocket.destroy();
    };

    socket.connect(25, mxIp, () => {
      addLog(`Direct TCP socket connection established to ${mxIp}:25`);
    });

    let buffer = '';

    const handleData = (chunk: Buffer) => {
      buffer += chunk.toString('utf-8');
      if (!buffer.endsWith('\r\n') && !buffer.endsWith('\n')) return;

      const response = buffer;
      buffer = '';

      const lines = response.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      const code = parseInt(lastLine.substring(0, 3), 10);

      addLog(`SERVER -> [${code}] ${lastLine.substring(4)}`);

      switch (currentStep) {
        case 'CONNECT':
          if (code === 220) {
            currentStep = 'EHLO_1';
            writeCommand(`EHLO ${senderDomain}`);
          } else {
            addLog(`Unexpected connection banner: ${code}`);
            cleanup();
            resolve({
              success: false,
              mxHost,
              mxIp,
              dkimSigned,
              startTlsEstablished,
              transmissionLog: log,
              responseCode: code,
              error: `Banner rejected with code ${code}`
            });
          }
          break;

        case 'EHLO_1':
          if (code === 250) {
            currentStep = 'STARTTLS';
            writeCommand('STARTTLS');
          } else {
            // EHLO fallback to HELO
            currentStep = 'HELO_1';
            writeCommand(`HELO ${senderDomain}`);
          }
          break;

        case 'HELO_1':
          currentStep = 'MAIL_FROM';
          writeCommand(`MAIL FROM:<${email.fromAddress}>`);
          break;

        case 'STARTTLS':
          if (code === 220) {
            addLog(`STARTTLS 220 Ready. Upgrading socket to TLS RFC 3207 stream...`);
            tlsSocket = tls.connect({
              socket: socket,
              rejectUnauthorized: false
            }, () => {
              startTlsEstablished = true;
              addLog(`TLS handshake completed. Secured channel active.`);
              currentStep = 'EHLO_2';
              tlsSocket!.on('data', handleData);
              writeCommand(`EHLO ${senderDomain}`);
            });
          } else {
            addLog(`STARTTLS not supported or refused (${code}). Proceeding over plaintext socket.`);
            currentStep = 'MAIL_FROM';
            writeCommand(`MAIL FROM:<${email.fromAddress}>`);
          }
          break;

        case 'EHLO_2':
          currentStep = 'MAIL_FROM';
          writeCommand(`MAIL FROM:<${email.fromAddress}>`);
          break;

        case 'MAIL_FROM':
          if (code === 250) {
            currentStep = 'RCPT_TO';
            writeCommand(`RCPT TO:<${email.toAddress}>`);
          } else {
            cleanup();
            resolve({
              success: false,
              mxHost,
              mxIp,
              dkimSigned,
              startTlsEstablished,
              transmissionLog: log,
              responseCode: code,
              error: `MAIL FROM rejected with code ${code}`
            });
          }
          break;

        case 'RCPT_TO':
          if (code === 250 || code === 251) {
            currentStep = 'DATA';
            writeCommand('DATA');
          } else {
            cleanup();
            resolve({
              success: false,
              mxHost,
              mxIp,
              dkimSigned,
              startTlsEstablished,
              transmissionLog: log,
              responseCode: code,
              error: `RCPT TO rejected with code ${code}`
            });
          }
          break;

        case 'DATA':
          if (code === 354) {
            currentStep = 'PAYLOAD';
            const payload = 
              `${dkimSignatureHeader}` +
              `From: ${email.fromAddress}\r\n` +
              `To: ${email.toAddress}\r\n` +
              `Subject: ${email.subject}\r\n` +
              `MIME-Version: 1.0\r\n` +
              `Content-Type: text/plain; charset=UTF-8\r\n\r\n` +
              `${email.body}\r\n.`;

            writeCommand(payload);
          } else {
            cleanup();
            resolve({
              success: false,
              mxHost,
              mxIp,
              dkimSigned,
              startTlsEstablished,
              transmissionLog: log,
              responseCode: code,
              error: `DATA prompt rejected with code ${code}`
            });
          }
          break;

        case 'PAYLOAD':
          if (code === 250) {
            addLog(`TRANSMISSION SUCCESSFUL! Server queued/accepted message with code 250.`);
            currentStep = 'QUIT';
            writeCommand('QUIT');
            setTimeout(() => {
              cleanup();
              resolve({
                success: true,
                mxHost,
                mxIp,
                dkimSigned,
                startTlsEstablished,
                transmissionLog: log,
                responseCode: 250
              });
            }, 500);
          } else {
            cleanup();
            resolve({
              success: false,
              mxHost,
              mxIp,
              dkimSigned,
              startTlsEstablished,
              transmissionLog: log,
              responseCode: code,
              error: `Payload delivery rejected with code ${code}`
            });
          }
          break;

        default:
          break;
      }
    };

    socket.on('data', handleData);

    socket.on('error', (err) => {
      addLog(`Socket error encountered: ${err.message}`);
      cleanup();
      resolve({
        success: false,
        mxHost,
        mxIp,
        dkimSigned,
        startTlsEstablished,
        transmissionLog: log,
        error: `Socket error: ${err.message}`
      });
    });

    socket.on('timeout', () => {
      addLog(`Socket timeout after 12000ms`);
      cleanup();
      resolve({
        success: false,
        mxHost,
        mxIp,
        dkimSigned,
        startTlsEstablished,
        transmissionLog: log,
        error: `Socket timeout connecting to ${mxHost}`
      });
    });
  });
}
