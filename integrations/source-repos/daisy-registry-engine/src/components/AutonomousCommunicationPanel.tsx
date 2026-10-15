import React, { useState, useRef, useEffect } from 'react';
import { Radio, ShieldAlert, Send, Bot, User, CheckCircle2, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { AutonomousCommunicator } from '../modules/AutonomousCommunicator';
import { CommunicatorMode, ChatMessage } from '../types';

export const AutonomousCommunicationPanel: React.FC = () => {
  const [communicator] = useState<AutonomousCommunicator>(new AutonomousCommunicator());
  const [messages, setMessages] = useState<ChatMessage[]>(communicator.getMessages());
  const [mode, setMode] = useState<CommunicatorMode>(communicator.getMode());
  const [input, setInput] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleModeToggle = (newMode: CommunicatorMode) => {
    setMode(newMode);
    communicator.setMode(newMode);
  };

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    const textToSend = input;
    setInput('');
    setIsSending(true);

    try {
      await communicator.sendMessage(textToSend);
      setMessages([...communicator.getMessages()]);
    } catch (e) {
      console.error('Error sending message:', e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Mode Switcher */}
      <div className="bg-[#0A0A10] border border-[#2A2A35] rounded-lg p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-[0.1em] text-[#E0E0F0] uppercase flex items-center space-x-2">
            <Radio className="w-5 h-5 text-[#00F0FF]" />
            <span>Autonomous Communicator & Dual Context Engine</span>
          </h1>
          <p className="text-[#A0A0B0] text-xs mt-1">
            Natural conversation interface with real-time semantic filtering and Dual Context Modes.
          </p>
        </div>

        {/* Dual Mode Switcher */}
        <div className="flex items-center bg-[#050507] p-1 rounded border border-[#2A2A35] text-xs font-mono">
          <button
            onClick={() => handleModeToggle('EXTERNAL_PROFESSIONAL')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
              mode === 'EXTERNAL_PROFESSIONAL'
                ? 'bg-[#00F0FF] text-[#050507] font-bold shadow'
                : 'text-[#808090] hover:text-[#E0E0F0]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>External Professional</span>
          </button>

          <button
            onClick={() => handleModeToggle('INTERNAL_POLITICAL')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
              mode === 'INTERNAL_POLITICAL'
                ? 'bg-[#FFB800] text-[#050507] font-bold shadow'
                : 'text-[#808090] hover:text-[#E0E0F0]'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5 text-[#050507]" />
            <span>Internal Political</span>
          </button>
        </div>
      </div>

      {/* Semantic Filter Protection Indicator */}
      <div className="bg-[#050507] border border-[#2A2A35] rounded p-3 flex items-center justify-between text-xs font-mono text-[#A0A0B0]">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#00FF41] green-glow animate-pulse"></span>
          <span>SemanticFilter.ts Online: Inappropriate language & slurs do not register / sanitized.</span>
        </div>
        <span className="text-[#00F0FF] text-[10px]">EAL6+ FILTER STANDARD</span>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-[#0A0A10] border border-[#2A2A35] rounded-lg p-6 h-[520px] flex flex-col space-y-4">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded bg-[#004040] border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF] shrink-0 cyan-glow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-2xl rounded p-4 space-y-2 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#121220] border border-[#00F0FF]/60 text-[#E0E0F0] rounded-br-none'
                    : 'bg-[#12121A] border border-[#2A2A35] text-[#E0E0F0] rounded-bl-none'
                }`}>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#505060] border-b border-[#1A1A25] pb-1 mb-1">
                    <span>{isUser ? 'User Vector' : 'Daisy Haminja AI'}</span>
                    <span className="text-[#00F0FF]">{msg.mode}</span>
                  </div>

                  {/* Message Content */}
                  <div className="whitespace-pre-wrap font-sans text-xs">
                    {msg.content}
                  </div>

                  {/* Raw Internal Dialectic Reasoning if Internal Mode */}
                  {msg.rawInternalReasoning && (
                    <div className="bg-[#050507] border border-[#FFB800]/40 p-3 rounded font-mono text-[11px] text-[#FFB800] mt-2 space-y-1">
                      <div className="font-bold flex items-center space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>RAW INTERNAL DIALECTIC NODE REASONING:</span>
                      </div>
                      <pre className="whitespace-pre-wrap text-[10px] leading-relaxed font-mono text-[#A0A0B0]">
                        {msg.rawInternalReasoning}
                      </pre>
                    </div>
                  )}

                  {/* Semantic Filter Pill if user message was sanitized */}
                  {msg.semanticMetrics && msg.semanticMetrics.profanityDetected && (
                    <div className="bg-[#382800] border border-[#FFB800]/40 text-[#FFB800] text-[10px] p-2 rounded font-mono mt-1">
                      ⚠️ Semantic Filter Neutralization: Cuss/slur triggers sanitized safely.
                    </div>
                  )}

                  {/* Verified Citations if available */}
                  {msg.verifiedCitations && msg.verifiedCitations.length > 0 && (
                    <div className="pt-2 border-t border-[#1A1A25] text-[10px] font-mono text-[#00F0FF]">
                      Sources: {msg.verifiedCitations.join(' • ')}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded bg-[#12121A] flex items-center justify-center text-[#A0A0B0] shrink-0 border border-[#2A2A35]">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-[#2A2A35] flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              mode === 'INTERNAL_POLITICAL'
                ? "Enter query for internal political dialectic reasoning..."
                : "Ask Daisy Haminja AI a question (profanity is neutralized)..."
            }
            className="flex-1 bg-[#050507] border border-[#2A2A35] text-[#E0E0F0] text-xs rounded p-2.5 focus:outline-none focus:border-[#00F0FF] font-sans"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="px-5 bg-[#00F0FF] hover:bg-white text-[#050507] font-bold text-xs uppercase tracking-wider rounded transition-all shadow-[0_0_12px_rgba(0,240,255,0.2)] flex items-center justify-center disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4 text-[#050507]" />
          </button>
        </div>
      </div>

    </div>
  );
};
