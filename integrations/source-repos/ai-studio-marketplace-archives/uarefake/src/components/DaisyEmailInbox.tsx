import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Inbox, 
  Star, 
  Sparkles, 
  RefreshCw, 
  Plus, 
  Building2, 
  User, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  DollarSign, 
  ExternalLink, 
  Paperclip, 
  Check, 
  ShieldCheck, 
  Bot,
  Zap,
  ChevronRight,
  X,
  Key,
  Globe
} from 'lucide-react';

interface EmailMessage {
  id: string;
  sender: string;
  recipient: string;
  timestamp: string;
  content: string;
}

interface EmailThread {
  id: string;
  companyName: string;
  contactName: string;
  contactTitle: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  folder: string;
  unread: boolean;
  starred: boolean;
  tag: string;
  timestamp: string;
  date: string;
  isAuthEmail?: boolean;
  messages: EmailMessage[];
  aiSummary: string;
  suggestedReply: string;
}

interface AccountInfo {
  name: string;
  title: string;
  email: string;
  status: string;
  unreadCount: number;
  autonomousPermissionsGranted?: boolean;
  permissionsGrantedAt?: string | null;
  isGmailConnected?: boolean;
  gmailConnectedEmail?: string;
  lastGmailSync?: string | null;
}

export default function DaisyEmailInbox() {
  const [account, setAccount] = useState<AccountInfo>({
    name: 'Daisy Haminja',
    title: 'Executive AI Assistant',
    email: 'daisy@uarefake.com',
    status: 'ACTIVE_ASSISTANT_ONLINE',
    unreadCount: 4,
    autonomousPermissionsGranted: false,
    isGmailConnected: false,
    gmailConnectedEmail: 'daisy@uarefake.com'
  });

  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<string>('inbox');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  // Gmail OAuth & App Password Connect Modal State
  const [isGmailModalOpen, setIsGmailModalOpen] = useState<boolean>(false);
  const [gmailOAuthTokenInput, setGmailOAuthTokenInput] = useState<string>('');
  const [appPasswordInput, setAppPasswordInput] = useState<string>('');
  const [appPasswordEmailInput, setAppPasswordEmailInput] = useState<string>('daisy.haminja@gmail.com');
  const [authTab, setAuthTab] = useState<'app_password' | 'oauth'>('app_password');
  const [connectingGmail, setConnectingGmail] = useState<boolean>(false);
  const [connectingAppPassword, setConnectingAppPassword] = useState<boolean>(false);
  const [gmailConnectStatus, setGmailConnectStatus] = useState<string | null>(null);
  const [syncingGmail, setSyncingGmail] = useState<boolean>(false);

  const handleConnectGmailAppPassword = async () => {
    if (!appPasswordInput) return;
    setConnectingAppPassword(true);
    setGmailConnectStatus(null);
    try {
      const res = await fetch('/api/gmail/connect-app-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: appPasswordEmailInput, appPassword: appPasswordInput })
      });
      const data = await res.json();
      if (data.success) {
        setGmailConnectStatus(`Successfully connected Daisy directly to live Gmail (${data.connectedEmail})!`);
        setIsGmailModalOpen(false);
        setAppPasswordInput('');
        fetchInbox();
      } else {
        setGmailConnectStatus(`Connection failed: ${data.error || 'Invalid App Password'}`);
      }
    } catch (err: any) {
      setGmailConnectStatus(`Error: ${err.message || 'Failed to connect'}`);
    } finally {
      setConnectingAppPassword(false);
    }
  };

  const handleConnectGmailWithToken = async (tokenToUse?: string) => {
    const token = tokenToUse || gmailOAuthTokenInput;
    if (!token) return;

    setConnectingGmail(true);
    setGmailConnectStatus(null);
    try {
      const res = await fetch('/api/gmail/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      if (data.success) {
        setGmailConnectStatus(`Successfully connected to live Gmail account: ${data.connectedEmail}!`);
        setIsGmailModalOpen(false);
        setGmailOAuthTokenInput('');
        fetchInbox();
        // Trigger immediate sync
        handleSyncGmail(token);
      } else {
        setGmailConnectStatus(`Connection failed: ${data.error || 'Invalid token'}`);
      }
    } catch (err: any) {
      setGmailConnectStatus(`Error: ${err.message || 'Failed to connect Gmail'}`);
    } finally {
      setConnectingGmail(false);
    }
  };

  const handleSyncGmail = async (overrideToken?: string) => {
    setSyncingGmail(true);
    try {
      const res = await fetch('/api/gmail/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: overrideToken })
      });
      const data = await res.json();
      if (data.success) {
        fetchInbox();
      }
    } catch (err) {
      console.error('Failed to sync Gmail', err);
    } finally {
      setSyncingGmail(false);
    }
  };

  const handleDisconnectGmail = async () => {
    try {
      await fetch('/api/gmail/disconnect', { method: 'POST' });
      fetchInbox();
    } catch (err) {
      console.error('Failed to disconnect Gmail', err);
    }
  };

  // Reply State
  const [replyText, setReplyText] = useState<string>('');
  const [includePaypalLink, setIncludePaypalLink] = useState<boolean>(false);
  const [sendingReply, setSendingReply] = useState<boolean>(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);

  // Compose Modal State
  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
  const [composeTo, setComposeTo] = useState<string>('');
  const [composeSubject, setComposeSubject] = useState<string>('');
  const [composeBody, setComposeBody] = useState<string>('');
  const [composeSending, setComposeSending] = useState<boolean>(false);

  // Simulation Modal State
  const [isSimulateOpen, setIsSimulateOpen] = useState<boolean>(false);
  const [simCompany, setSimCompany] = useState<string>('Apex Strategic Systems');
  const [simContact, setSimContact] = useState<string>('Michael Sterling');
  const [simEmail, setSimEmail] = useState<string>('m.sterling@apexstrategic.com');
  const [simSubject, setSimSubject] = useState<string>('Inquiry: Enterprise Solutions & Payment Options');
  const [simContent, setSimContent] = useState<string>(
    `Hi Daisy,\n\nOur executive team is reviewing software vendor options for our Q3 digital transformation initiative.\n\nCould you please send over your enterprise licensing terms and confirm if we can finalize payment directly via PayPal?\n\nBest regards,\nMichael Sterling\nVP of Operations | Apex Strategic Systems`
  );
  const [simulating, setSimulating] = useState<boolean>(false);

  // Permission Grant & Auth Email State
  const [grantingPermissions, setGrantingPermissions] = useState<boolean>(false);
  const [grantSuccessMessage, setGrantSuccessMessage] = useState<string | null>(null);

  const handleGrantPermissions = async () => {
    setGrantingPermissions(true);
    setGrantSuccessMessage(null);
    try {
      const res = await fetch('/api/daisy/grant-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setGrantSuccessMessage(`Permissions successfully granted! Daisy Haminja (${data.account.email}) now has full autonomous access for all external company contacts.`);
        fetchInbox();
      }
    } catch (err) {
      console.error('Failed to grant permissions', err);
    } finally {
      setGrantingPermissions(false);
    }
  };

  const handleSendAuthEmail = async () => {
    try {
      const res = await fetch('/api/daisy/send-auth-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerEmail: 'gods.battle.axe.88@gmail.com' })
      });
      const data = await res.json();
      if (data.success) {
        fetchInbox();
        if (data.threadId) {
          setSelectedThreadId(data.threadId);
        }
      }
    } catch (err) {
      console.error('Failed to send authorization email', err);
    }
  };

  // Email Identity Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsName, setSettingsName] = useState<string>('Daisy Haminja');
  const [settingsEmail, setSettingsEmail] = useState<string>('daisy.haminja@gmail.com');
  const [settingsTitle, setSettingsTitle] = useState<string>('Executive AI Assistant');
  const [savingSettings, setSavingSettings] = useState<boolean>(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);

  // Fetch Daisy's Inbox
  const fetchInbox = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/daisy/inbox');
      if (res.ok) {
        const data = await res.json();
        setAccount(data.account);
        if (data.account.email) {
          setSettingsEmail(data.account.email);
        }
        setThreads(data.emails);
        if (data.emails.length > 0 && !selectedThreadId) {
          setSelectedThreadId(data.emails[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load Daisy inbox', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(null);
    try {
      const res = await fetch('/api/daisy/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: settingsName,
          email: settingsEmail,
          title: settingsTitle
        })
      });
      const data = await res.json();
      if (data.success) {
        setSettingsSuccess(`Email successfully updated to ${settingsEmail}!`);
        fetchInbox();
        setTimeout(() => {
          setIsSettingsOpen(false);
          setSettingsSuccess(null);
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    fetchInbox();

    // Automatically catch returning Google OAuth access token from URL hash fragment
    if (typeof window !== 'undefined' && window.location.hash && window.location.hash.includes('access_token=')) {
      try {
        const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
        const token = hashParams.get('access_token');
        if (token) {
          window.history.replaceState(null, '', window.location.pathname);
          handleConnectGmailWithToken(token);
        }
      } catch (err) {
        console.error('Error parsing OAuth hash token:', err);
      }
    }
  }, []);

  const selectedThread = threads.find(t => t.id === selectedThreadId);

  // Auto-fill suggested reply when selecting a thread
  useEffect(() => {
    if (selectedThread && selectedThread.suggestedReply) {
      setReplyText(selectedThread.suggestedReply);
    } else {
      setReplyText('');
    }
    setSendSuccessMessage(null);
  }, [selectedThreadId]);

  // Handle Send Reply
  const handleSendReply = async () => {
    if (!selectedThread || !replyText.trim()) return;

    setSendingReply(true);
    setSendSuccessMessage(null);

    let finalContent = replyText;
    if (includePaypalLink && !finalContent.includes('paypal.me/tjites')) {
      finalContent += `\n\n--- Verified Payment Settlement Link ---\nPayPal Merchant: https://paypal.me/tjites`;
    }

    try {
      const res = await fetch('/api/daisy/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: selectedThread.id,
          to: selectedThread.senderEmail,
          subject: `Re: ${selectedThread.subject}`,
          messageContent: finalContent
        })
      });

      const data = await res.json();
      if (data.success) {
        setSendSuccessMessage(data.message || 'Email sent successfully!');
        setReplyText('');
        fetchInbox();
      }
    } catch (e) {
      console.error('Failed to send reply', e);
    } finally {
      setSendingReply(false);
    }
  };

  // Handle AI Auto-Draft Reply
  const handleGenerateAiDraft = () => {
    if (!selectedThread) return;
    const name = selectedThread.contactName.split(' ')[0] || 'there';
    const draft = `Hi ${name},\n\nThank you for reaching out to Daisy at SolveXia!\n\nI have reviewed your message regarding "${selectedThread.subject}" for ${selectedThread.companyName}.\n\nOur executive team would be delighted to partner with you. All corporate license packages are pre-certified and support direct instant settlement via our merchant payment gateway at https://paypal.me/tjites.\n\nI am available to assist with any onboarding agreements or contract documentation you require.\n\nWarm regards,\n\nDaisy\nExecutive AI Assistant | SolveXia\ndaisy@solvexia.ai`;
    setReplyText(draft);
  };

  // Handle Send New Compose Message
  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo || !composeBody) return;

    setComposeSending(true);
    try {
      const res = await fetch('/api/daisy/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: composeTo,
          subject: composeSubject || 'Correspondence from Daisy (SolveXia Executive Assistant)',
          messageContent: composeBody
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsComposeOpen(false);
        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
        fetchInbox();
      }
    } catch (e) {
      console.error('Failed to send new email', e);
    } finally {
      setComposeSending(false);
    }
  };

  // Handle Ingest Incoming External Email
  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    try {
      const res = await fetch('/api/daisy/ingest-incoming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: simCompany,
          contactName: simContact,
          contactEmail: simEmail,
          subject: simSubject,
          content: simContent
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsSimulateOpen(false);
        fetchInbox();
        if (data.email?.id) {
          setSelectedThreadId(data.email.id);
        }
      }
    } catch (e) {
      console.error('Failed to simulate email', e);
    } finally {
      setSimulating(false);
    }
  };

  // Filter threads based on folder, search query, and tags
  const filteredThreads = threads.filter(thread => {
    // Folder match
    if (activeFolder === 'inbox' && thread.folder !== 'inbox') return false;
    if (activeFolder === 'sent' && thread.folder !== 'sent') return false;
    if (activeFolder === 'starred' && !thread.starred) return false;

    // Search Query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchComp = thread.companyName.toLowerCase().includes(q);
      const matchContact = thread.contactName.toLowerCase().includes(q);
      const matchSubject = thread.subject.toLowerCase().includes(q);
      const matchEmail = thread.senderEmail.toLowerCase().includes(q);
      if (!matchComp && !matchContact && !matchSubject && !matchEmail) return false;
    }

    // Tag Filter
    if (tagFilter !== 'all') {
      if (tagFilter === 'unread' && !thread.unread) return false;
      if (tagFilter === 'inquiry' && !thread.tag.toLowerCase().includes('inquiry')) return false;
      if (tagFilter === 'contract' && !thread.tag.toLowerCase().includes('contract')) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Executive Assistant Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Bot className="w-7 h-7 text-indigo-400" />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                  {account.name}'s Executive Email Suite
                </h2>
                {account.isGmailConnected ? (
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    LIVE GMAIL OAUTH CONNECTED ({account.gmailConnectedEmail})
                  </span>
                ) : account.autonomousPermissionsGranted ? (
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    AUTONOMOUS EXTERNAL CLEARANCE: AUTHORIZED
                  </span>
                ) : (
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1.5 animate-pulse">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    PERMISSIONS: PENDING OWNER EMAIL GRANT
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-indigo-300 font-bold bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/50">
                  {account.email}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 font-semibold">{account.title}</span>
                <span className="text-slate-500">•</span>
                <span className="px-2 py-0.5 bg-purple-950/60 border border-purple-500/40 text-purple-300 text-[11px] font-bold rounded flex items-center gap-1">
                  <Zap className="w-3 h-3 text-purple-400" /> MMTAI Autonomous Decision Authority
                </span>
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end flex-wrap">
            {account.isGmailConnected ? (
              <button
                onClick={() => handleSyncGmail()}
                disabled={syncingGmail}
                className="px-3.5 py-2 bg-emerald-900/60 hover:bg-emerald-900/90 border border-emerald-600/50 text-emerald-200 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
              >
                <RefreshCw className={`w-4 h-4 text-emerald-400 ${syncingGmail ? 'animate-spin' : ''}`} />
                {syncingGmail ? 'Syncing Gmail...' : 'Sync Live Gmail Inbox'}
              </button>
            ) : (
              <button
                onClick={() => setIsGmailModalOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg shadow-red-700/20"
              >
                <Mail className="w-4 h-4 text-white" />
                Connect Daisy's Gmail (OAuth)
              </button>
            )}

            {!account.autonomousPermissionsGranted && (
              <button
                onClick={handleSendAuthEmail}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-700/20"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                Send Owner Auth Email
              </button>
            )}

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-indigo-400" />
              Change Assistant Email
            </button>

            <button
              onClick={() => setIsSimulateOpen(true)}
              className="px-3.5 py-2 bg-indigo-900/40 hover:bg-indigo-900/70 border border-indigo-700/50 text-indigo-200 text-xs font-semibold rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              Receive Incoming Lead
            </button>

            <button
              onClick={fetchInbox}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition cursor-pointer"
              title="Refresh Inbox"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

        </div>

        {/* Executive Authorization Guidance Banner */}
        <div className={`mt-4 p-3.5 rounded-xl border flex items-start gap-3 text-xs relative z-10 transition ${
          account.autonomousPermissionsGranted
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-200'
        }`}>
          <ShieldCheck className={`w-5 h-5 shrink-0 mt-0.5 ${
            account.autonomousPermissionsGranted ? 'text-emerald-400' : 'text-indigo-400 animate-pulse'
          }`} />
          <div className="leading-relaxed space-y-1">
            <div className="font-bold text-slate-100 flex items-center gap-2">
              <span>Executive Autonomous Outreach Authorization Workflow</span>
              {account.autonomousPermissionsGranted ? (
                <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                  100% AUTHORIZED
                </span>
              ) : (
                <span className="text-[10px] bg-amber-900/80 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                  ACTION REQUIRED
                </span>
              )}
            </div>
            <p className="text-slate-300">
              {account.autonomousPermissionsGranted ? (
                <>
                  Permissions confirmed! <strong className="text-white">{account.name}</strong> (<code className="font-mono text-emerald-300">{account.email}</code>) has full clearance to receive, process, and respond to all external company contacts outside of this email thread autonomously.
                </>
              ) : (
                <>
                  To grant autonomous permissions: Select the <strong className="text-white">Executive Authorization Email</strong> in {account.name}'s inbox (or click <button onClick={handleSendAuthEmail} className="text-emerald-300 font-bold underline cursor-pointer hover:text-emerald-200">Send Owner Auth Email</button>). Clicking the grant link inside the email will instantly provide permissions for all external company contacts outside of that email to access and communicate autonomously.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main Mail Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[680px]">
        
        {/* Left Sidebar & Email List Column (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col space-y-4 shadow-xl">
          
          {/* Folders Bar */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveFolder('inbox')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  activeFolder === 'inbox'
                    ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                Inbox
                {account.unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-indigo-500 text-slate-950 text-[10px] font-bold rounded-full ml-0.5">
                    {account.unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveFolder('sent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  activeFolder === 'sent'
                    ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                Sent
              </button>

              <button
                onClick={() => setActiveFolder('starred')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  activeFolder === 'starred'
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                Starred
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              {filteredThreads.length} Thread{filteredThreads.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Search & Quick Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company, contact, subject..."
                className="w-full bg-slate-950 border border-slate-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <button
                onClick={() => setTagFilter('all')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer whitespace-nowrap ${
                  tagFilter === 'all'
                    ? 'bg-slate-800 text-slate-200 font-bold'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTagFilter('unread')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer whitespace-nowrap ${
                  tagFilter === 'unread'
                    ? 'bg-indigo-950 border border-indigo-800 text-indigo-300 font-bold'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-300'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setTagFilter('inquiry')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer whitespace-nowrap ${
                  tagFilter === 'inquiry'
                    ? 'bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-300'
                }`}
              >
                Inquiries
              </button>
            </div>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar max-h-[520px]">
            {filteredThreads.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <Mail className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                No email correspondence found in this view.
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = thread.id === selectedThreadId;
                const lastMessage = thread.messages[thread.messages.length - 1];

                return (
                  <div
                    key={thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer relative ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/40 shadow-md'
                        : thread.unread
                        ? 'bg-slate-950/80 border-indigo-900/50 hover:bg-slate-900'
                        : 'bg-slate-950/30 border-slate-800/50 hover:bg-slate-900/60'
                    }`}
                  >
                    {thread.unread && (
                      <span className="absolute top-3.5 right-3 h-2 w-2 rounded-full bg-indigo-400"></span>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {thread.companyName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                            {thread.companyName}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {thread.contactName}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {thread.timestamp}
                      </span>
                    </div>

                    <div className="mt-2">
                      <p className="text-xs font-medium text-slate-300 truncate">
                        {thread.subject}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 line-clamp-1">
                        {lastMessage?.content.replace(/\n/g, ' ')}
                      </p>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-indigo-300">
                        {thread.tag}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {thread.messages.length} msg{thread.messages.length > 1 ? 's' : ''}
                      </span>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Email Content & Daisy Assistant Panel (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-xl min-h-[600px]">
          
          {selectedThread ? (
            <div className="space-y-5 flex-1 flex flex-col justify-between">
              
              {/* Thread Header */}
              <div>
                <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-indigo-950 border border-indigo-800 text-indigo-300">
                        {selectedThread.tag}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Via {selectedThread.recipientEmail}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100">
                      {selectedThread.subject}
                    </h3>

                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-300">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-bold text-slate-200">{selectedThread.companyName}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{selectedThread.contactName} ({selectedThread.contactTitle})</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono text-slate-400 block">
                      {selectedThread.date}
                    </span>
                    <span className="text-[11px] font-mono text-indigo-400 font-bold block mt-0.5">
                      {selectedThread.senderEmail}
                    </span>
                  </div>
                </div>

                {/* AI Executive Summary Box */}
                {selectedThread.aiSummary && (
                  <div className="mt-4 p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-bold mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Daisy AI Executive Assistant Briefing:
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {selectedThread.aiSummary}
                    </p>
                  </div>
                )}
              </div>

              {/* Special Executive Authorization Call-to-Action Card */}
              {(selectedThread.isAuthEmail || selectedThread.subject.includes('Authorization')) && (
                <div className="my-3 p-4 bg-gradient-to-br from-slate-900 via-indigo-950/90 to-slate-900 border-2 border-indigo-500/60 rounded-2xl shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
                      <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                        Executive Permission Authorization Gateway
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                      ID: {account.name}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    By clicking the button below, you officially grant executive authorization for <strong className="text-white">{account.name}</strong> (<code className="text-indigo-300 font-mono">{account.email}</code>). This instantly provides permissions for all further company contacts outside of this email thread to access and communicate autonomously.
                  </p>

                  {account.autonomousPermissionsGranted ? (
                    <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold rounded-xl flex items-center justify-between gap-2 shadow-inner">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>AUTONOMOUS PERMISSIONS ACTIVATED & GRANTED TO DAISY HAMINJA</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">
                        Status: 100% Authorized
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={handleGrantPermissions}
                      disabled={grantingPermissions}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
                    >
                      <Zap className={`w-4 h-4 text-white ${grantingPermissions ? 'animate-spin' : ''}`} />
                      {grantingPermissions
                        ? 'Activating Autonomous Permissions...'
                        : '⚡ Click to Grant Autonomous External Permissions to Daisy Haminja'}
                    </button>
                  )}

                  {grantSuccessMessage && (
                    <p className="mt-2 text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {grantSuccessMessage}
                    </p>
                  )}
                </div>
              )}

              {/* Thread Messages Stream */}
              <div className="space-y-3.5 my-4 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
                {selectedThread.messages.map((msg, index) => {
                  const isDaisy = msg.sender.includes('Daisy');
                  return (
                    <div
                      key={msg.id || index}
                      className={`p-4 rounded-xl border ${
                        isDaisy
                          ? 'bg-indigo-950/30 border-indigo-800/40 ml-4'
                          : 'bg-slate-950/70 border-slate-800/70 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/50 pb-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isDaisy ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {isDaisy ? 'D' : msg.sender.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-200">
                              {msg.sender}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono ml-2">
                              To: {msg.recipient}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono text-slate-400">
                          {msg.timestamp}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Daisy Reply Editor Section */}
              <div className="border-t border-slate-800/80 pt-4 space-y-3">
                
                {sendSuccessMessage && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{sendSuccessMessage}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-indigo-400" />
                    Respond as Daisy (daisy@solvexia.ai)
                  </span>

                  <button
                    onClick={handleGenerateAiDraft}
                    className="px-2.5 py-1 bg-indigo-900/40 hover:bg-indigo-900/70 border border-indigo-700/50 text-indigo-300 text-[11px] font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Auto-Draft Assistant Reply
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response or click 'Auto-Draft Assistant Reply'..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none font-sans"
                />

                <div className="flex items-center justify-between gap-3 flex-wrap">
                  
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includePaypalLink}
                      onChange={(e) => setIncludePaypalLink(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                    />
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Include PayPal Merchant Payment Link (paypal.me/tjites)</span>
                  </label>

                  <button
                    onClick={handleSendReply}
                    disabled={sendingReply || !replyText.trim()}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer ml-auto"
                  >
                    <Send className={`w-3.5 h-3.5 ${sendingReply ? 'animate-spin' : ''}`} />
                    {sendingReply ? 'Sending as Daisy...' : 'Send Email as Daisy'}
                  </button>

                </div>

              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
              <Mail className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-sm font-semibold text-slate-400">Select an email thread to view conversation</p>
              <p className="text-xs text-slate-500 mt-1">Daisy's Assistant Inbox is online and connected to company partners.</p>
            </div>
          )}

        </div>

      </div>

      {/* MODAL: Compose New Email as Daisy */}
      {isComposeOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsComposeOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-slate-100">
                New Email from Daisy (daisy@solvexia.ai)
              </h3>
            </div>

            <form onSubmit={handleComposeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  To (Company / Recipient Email):
                </label>
                <input
                  type="email"
                  required
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="e.g. procurement@nexuslogistics.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Subject:
                </label>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="e.g. SolveXia Vendor Partnership & Licensing Deck"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Message Content:
                </label>
                <textarea
                  rows={6}
                  required
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Type message content..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={composeSending}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  <Send className={`w-3.5 h-3.5 ${composeSending ? 'animate-spin' : ''}`} />
                  {composeSending ? 'Sending...' : 'Send as Daisy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Ingest Incoming External Enterprise Email */}
      {isSimulateOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsSimulateOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-slate-100">
                Ingest Incoming Enterprise Inquiry for {account.name}
              </h3>
            </div>

            <form onSubmit={handleSimulateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company Name:</label>
                <input
                  type="text"
                  required
                  value={simCompany}
                  onChange={(e) => setSimCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Name:</label>
                  <input
                    type="text"
                    required
                    value={simContact}
                    onChange={(e) => setSimContact(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Email:</label>
                  <input
                    type="email"
                    required
                    value={simEmail}
                    onChange={(e) => setSimEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subject:</label>
                <input
                  type="text"
                  required
                  value={simSubject}
                  onChange={(e) => setSimSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Inquiry Content:</label>
                <textarea
                  rows={4}
                  required
                  value={simContent}
                  onChange={(e) => setSimContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSimulateOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={simulating}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-600/30"
                >
                  <Zap className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
                  {simulating ? 'Delivering...' : 'Receive in Daisy Inbox'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Email Identity & Custom Domain Settings */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-slate-100">
                Change Daisy's Assistant Email & Identity
              </h3>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              You do not need access to <code className="text-slate-300 font-mono">solvexia.ai</code>. Set Daisy's active email to your actual personal address or custom domain below so all incoming messages, replies, and notifications route directly to your account.
            </p>

            {settingsSuccess && (
              <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {settingsSuccess}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Assistant Name:
                </label>
                <input
                  type="text"
                  required
                  value={settingsName}
                  onChange={(e) => setSettingsName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Active Assistant Email Address (Your Real Email / Domain):
                </label>
                <input
                  type="email"
                  required
                  value={settingsEmail}
                  onChange={(e) => setSettingsEmail(e.target.value)}
                  placeholder="e.g. gods.battle.axe.88@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 font-mono focus:outline-none focus:border-indigo-500/50"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Default set to your personal email: <code className="text-indigo-300 font-mono">gods.battle.axe.88@gmail.com</code>
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Title / Role Designation:
                </label>
                <input
                  type="text"
                  required
                  value={settingsTitle}
                  onChange={(e) => setSettingsTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${savingSettings ? 'animate-spin' : ''}`} />
                  {savingSettings ? 'Saving...' : 'Update Assistant Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Gmail OAuth Connection Modal */}
      {isGmailModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setIsGmailModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Connect Daisy Haminja to Live Google Gmail
                </h3>
                <p className="text-xs text-indigo-400 font-mono">
                  OAuth 2.0 Authorized Scope Integration
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Connect Daisy's assistant inbox directly to your official Google account (<code className="text-emerald-400 font-mono">daisy.haminja@gmail.com</code> / <code className="text-indigo-300 font-mono font-bold">gods.battle.axe.88@gmail.com</code>). Daisy will fetch real incoming email messages, construct responses under MMTAI protocol guidelines, and dispatch live emails directly via Google's official Gmail API.
            </p>

            {gmailConnectStatus && (
              <div className="mb-4 p-3 bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-xs rounded-xl flex items-center gap-2 font-mono">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                {gmailConnectStatus}
              </div>
            )}

            <div className="flex items-center gap-2 mb-4 bg-slate-950 p-1 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setAuthTab('app_password')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${authTab === 'app_password' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Key className="w-3.5 h-3.5" />
                1. Google App Password (Bypasses Phone Account)
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('oauth')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${authTab === 'oauth' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Globe className="w-3.5 h-3.5" />
                2. Browser OAuth Redirect
              </button>
            </div>

            {authTab === 'app_password' ? (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-200">
                  <p className="font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Bypasses Sister's Saved Phone Account Lock:
                  </p>
                  <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                    Connecting via a 16-character App Password connects Daisy's server directly to Google. This <strong>100% avoids browser redirects</strong> so your sister's saved account on this phone will never interfere!
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1.5 text-xs">
                  <p className="font-bold text-slate-200">How to get a 16-Character App Password (30 Seconds):</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-snug">
                    <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-mono font-bold">myaccount.google.com/apppasswords</a></li>
                    <li>Sign into <span className="text-emerald-400 font-mono font-bold">daisy.haminja@gmail.com</span></li>
                    <li>Type <code className="text-indigo-300">Daisy Assistant</code> as the app name and tap <strong>Create</strong></li>
                    <li>Copy the 16-letter password and paste it below:</li>
                  </ol>
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Daisy's Gmail Account:</label>
                  <input
                    type="email"
                    value={appPasswordEmailInput}
                    onChange={(e) => setAppPasswordEmailInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">16-Character Google App Password:</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={appPasswordInput}
                      onChange={(e) => setAppPasswordInput(e.target.value)}
                      placeholder="abcd efgh ijkl mnop"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      disabled={connectingAppPassword || !appPasswordInput}
                      onClick={handleConnectGmailAppPassword}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-950/50"
                    >
                      <CheckCircle2 className={`w-4 h-4 ${connectingAppPassword ? 'animate-spin' : ''}`} />
                      {connectingAppPassword ? 'Connecting...' : 'Connect Daisy'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
              <div className="bg-amber-950/40 border border-amber-500/30 p-3 rounded-xl">
                <p className="text-[11px] text-amber-200 leading-snug font-medium mb-2">
                  <strong className="text-amber-400">Shared Phone / Multiple Accounts Notice:</strong> If this phone defaults to another person's Google account, select one of the dedicated options below or copy the link into an <strong>Incognito / Private tab</strong>.
                </p>
              </div>

              {/* Primary Dedicated Daisy Login Button */}
              <button
                type="button"
                onClick={() => {
                  const clientId = "82390498302-google-oauth-client.apps.googleusercontent.com";
                  const scope = encodeURIComponent("https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify");
                  const redirectUri = encodeURIComponent(window.location.origin);
                  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=consent%20select_account&login_hint=daisy.haminja@gmail.com`;
                  window.open(authUrl, "_blank");
                }}
                className="w-full py-3 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xl cursor-pointer"
              >
                <Mail className="w-4 h-4 text-white" />
                Authorize Specifically for: daisy.haminja@gmail.com
              </button>

              {/* Force Account Switcher Button */}
              <button
                type="button"
                onClick={() => {
                  const clientId = "82390498302-google-oauth-client.apps.googleusercontent.com";
                  const scope = encodeURIComponent("https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify");
                  const redirectUri = encodeURIComponent(window.location.origin);
                  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=consent%20select_account`;
                  window.open(authUrl, "_blank");
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                Force Google Account Chooser (Pick or Add Account)
              </button>

              {/* Incognito Copy Link Button */}
              <button
                type="button"
                onClick={() => {
                  const clientId = "82390498302-google-oauth-client.apps.googleusercontent.com";
                  const scope = encodeURIComponent("https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify");
                  const redirectUri = encodeURIComponent(window.location.origin);
                  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=consent%20select_account&login_hint=daisy.haminja@gmail.com`;
                  navigator.clipboard.writeText(authUrl);
                  setGmailConnectStatus("Auth link copied! Open an Incognito / Private browser tab and paste this link to log into daisy.haminja@gmail.com.");
                }}
                className="w-full py-2 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-300 font-mono text-[11px] rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Copy Auth URL for Incognito / Private Tab (Bypass Saved Sister's Account)
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] text-slate-500 font-mono uppercase">Or Manual Token / Key Input</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">
                  Google OAuth Access Token / Session Key:
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={gmailOAuthTokenInput}
                    onChange={(e) => setGmailOAuthTokenInput(e.target.value)}
                    placeholder="ya29.a0A..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-red-500/50"
                  />
                  <button
                    type="button"
                    disabled={connectingGmail || !gmailOAuthTokenInput}
                    onClick={() => handleConnectGmailWithToken()}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className={`w-4 h-4 ${connectingGmail ? 'animate-spin' : ''}`} />
                    Verify & Connect
                  </button>
                </div>
              </div>

              {account.isGmailConnected && (
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Active: {account.gmailConnectedEmail}
                  </span>
                  <button
                    type="button"
                    onClick={handleDisconnectGmail}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer underline"
                  >
                    Disconnect Gmail
                  </button>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      )}

    </div>
  );
}
