import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";
import { exec } from "child_process";

const app = express();
const PORT = 3000;

// Need to match the 380 bytes strict payload validation
app.use(express.text({ type: "application/json" })); // read as text first to check length
app.use(express.json());

const ledgerFile = path.resolve(process.cwd(), "consensus_memory.json");

// Define basic jobs DB
const jobs: Record<string, any> = {};

// Hardcoded Protocol Start Date
const PROTOCOL_START_DATE = new Date("2026-03-01T00:00:00Z");

app.use("/api", (req, res, next) => {
    // Enforce Protocol Start Date
    if (new Date() < PROTOCOL_START_DATE) {
        return res.status(403).json({ detail: "Forensic Lockdown: Protocol Execution Date Not Reached (March 1, 2026)" });
    }
    
    // Strict 380 byte payload validation for POST
    if (req.method === "POST") {
        let bodyBuffer: Buffer;
        
        // Handle body if it was parsed as object vs string/buffer
        if (typeof req.body === 'string') {
            bodyBuffer = Buffer.from(req.body, "utf-8");
        } else if (Buffer.isBuffer(req.body)) {
            bodyBuffer = req.body;
        } else {
            // fallback if it went to JSON directly
            bodyBuffer = Buffer.from(JSON.stringify(req.body), "utf-8");
        }

        if (bodyBuffer.length !== 380) {
            return res.status(400).json({ detail: `Protocol Mismatch: Payload must be exactly 380 characters. Received ${bodyBuffer.length}.` });
        }

        // Check if we should log to ledger
        const originalSend = res.send;
        let logged = false;

        res.send = function (body) {
            // Log successful submissions (200/201)
            if (!logged && (res.statusCode === 200 || res.statusCode === 201)) {
                logged = true;
                const entry = {
                    timestamp: new Date().toISOString(),
                    event: `POST ${req.path}`,
                    fingerprint_sha256: crypto.createHash('sha256').update(bodyBuffer).digest('hex')
                };
                
                try {
                    fs.appendFileSync(ledgerFile, JSON.stringify(entry) + "\n");
                } catch (e) {
                    console.error("Ledger write error:", e);
                }
            }
            return originalSend.apply(res, arguments as any);
        };
        
        // Need to manually parse JSON since we used express.text() for accurate length reading
        if (typeof req.body === 'string') {
            try {
                req.body = JSON.parse(req.body);
            } catch (e) {
                // If it's invalid JSON due to trimming, let's catch edge cases
                try {
                    // Try to extract the valid JSON part before padding
                    const trimmed = req.body.replace(/\x00/g, '').trim();
                    req.body = JSON.parse(trimmed);
                } catch (e2) {
                    req.body = {};
                }
            }
        }
    }
    next();
});

app.get("/api/v1/health", (req, res) => {
    // In actual Python this checks a ~/.solvex_node/vault/ai_handshake.txt 
    // We'll mock it for the web UI preview.
    res.json({
        status: "online",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        layer: "SOLVEX-TRANSACTION",
        node_status: {
            status: "VERIFIED",
            signature: "HSD-MK2-0x992B1"
        }
    });
});

app.get("/api/v1/ledger", (req, res) => {
    try {
        if (!fs.existsSync(ledgerFile)) {
            return res.json({ ledger: [] });
        }
        const fileContent = fs.readFileSync(ledgerFile, "utf-8");
        const entries = fileContent.split("\n").filter(Boolean).map(line => {
            try {
                return JSON.parse(line);
            } catch (e) {
                return null;
            }
        }).filter(Boolean);
        
        return res.json({ ledger: entries.reverse() });
    } catch (e: any) {
        res.status(500).json({ detail: e.message });
    }
});

app.get("/api/v1/test_trespass", (req, res) => {
    // Make script executable first
    exec("chmod +x test_trespass.sh && chmod +x ./security-pipeline/gatekeeper.sh && ./test_trespass.sh", (error, stdout, stderr) => {
        res.json({
            stdout,
            stderr,
            error: error?.message,
            success: !error
        });
    });
});

app.get("/api/v1/test_legit", (req, res) => {
    // Generate RSA keys if missing, then execute test_legit.sh
    const setupKeys = "mkdir -p ./security-pipeline/keys && if [ ! -f ./security-pipeline/keys/node_private.pem ]; then openssl genpkey -algorithm RSA -out ./security-pipeline/keys/node_private.pem -pkeyopt rsa_keygen_bits:2048 && openssl rsa -pubout -in ./security-pipeline/keys/node_private.pem -out ./security-pipeline/keys/active_node.key; fi";
    
    exec(`${setupKeys} && chmod +x test_legit.sh && chmod +x ./security-pipeline/gatekeeper.sh && ./test_legit.sh`, (error, stdout, stderr) => {
        res.json({
            stdout,
            stderr,
            error: error?.message,
            success: !error
        });
    });
});

app.get("/api/v1/flood_test", (req, res) => {
    exec(`chmod +x flood_test.sh && chmod +x ./security-pipeline/gatekeeper.sh && ./flood_test.sh`, (error, stdout, stderr) => {
        // We expect flood test to succeed (bash script exits 0 if it runs fully),
        // the internal checks will print the breach count.
        res.json({
            stdout,
            stderr,
            error: error?.message,
            success: !error
        });
    });
});

app.get("/api/v1/stress_test", (req, res) => {
    exec(`chmod +x stress_test.sh && chmod +x ./security-pipeline/gatekeeper.sh && ./stress_test.sh`, (error, stdout, stderr) => {
        res.json({
            stdout,
            stderr,
            error: error?.message,
            success: !error
        });
    });
});

app.get("/api/v1/export-project", (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const archiveName = `agate-workspace-${timestamp}.tar.gz`;
        const archivePath = path.join("/tmp", archiveName);
        
        exec(`tar -czf ${archivePath} --exclude=node_modules --exclude=.git --exclude=dist --exclude=.next .`, (error, stdout, stderr) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            res.download(archivePath, archiveName, (err) => {
                if (err) console.error("Download failed:", err);
                setTimeout(() => fs.unlink(archivePath, () => {}), 60000);
            });
        });
    } catch(e: any) {
        res.status(500).json({ detail: e.message });
    }
});

app.post("/api/v1/jobs", (req, res) => {
    const data = req.body;
    const jobId = `JOB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    jobs[jobId] = {
        title: data.title || "Forensic Ledger Entry",
        encrypted_content: data.encrypted_content || "",
        target_node: data.target_node || "CORE-PRIMARY",
        status: "PENDING",
        created_at: new Date().toISOString()
    };
    
    res.status(201).json({
        jobId,
        title: jobs[jobId].title,
        status: jobs[jobId].status,
        created_at: jobs[jobId].created_at
    });
});

async function startServer() {
    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Express Mock Server for AI Studio running on http://localhost:${PORT}`);
    });
}

startServer();
