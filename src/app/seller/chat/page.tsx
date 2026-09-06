 'use client';

import { useState } from 'react';
import { MessageCircle, Search, User, ShieldCheck, Send } from 'lucide-react';

// Mock active shopper rooms simulation
const MOCK_CHAT_THREADS = [
  { id: 't1', customerName: 'Juan Dela Cruz', lastMessage: 'Available pa po ba ito?', time: '2 mins ago', unread: true },
  { id: 't2', customerName: 'Maria Clara', lastMessage: 'Salamat po sa mabilis na ship!', time: '1 hr ago', unread: false },
  { id: 't3', customerName: 'Pedro Penduko', lastMessage: 'Magkano po kapag wholesale?', time: 'Yesterday', unread: false }
];

export default function SellerChatPage() {
  const [threads] = useState(MOCK_CHAT_THREADS);
  const [activeThread, setActiveThread] = useState(MOCK_CHAT_THREADS[0]);
  const [replyText, setReplyText] = useState('');
  const [messages, setMessages] = useState<Record<string, { sender: string; text: string }[]>>({
    t1: [{ sender: 'Customer', text: 'Available pa po ba ito?' }],
    t2: [{ sender: 'Customer', text: 'Salamat po sa mabilis na ship!' }, { sender: 'Seller', text: 'Walang anuman po!' }],
    t3: [{ sender: 'Customer', text: 'Magkano po kapag wholesale?' }]
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setMessages(prev => ({
      ...prev,
      [activeThread.id]: [
        ...(prev[activeThread.id] || []),
        { sender: 'Seller', text: replyText }
      ]
    }));
    setReplyText('');
  };

  const currentMessages = messages[activeThread.id] || [];

  return (
    <main className="flex-1 flex flex-col md:flex-row h-screen bg-paper text-ink font-body overflow-hidden animate-in fade-in duration-300">
      
      {/* LEFT COLUMN: ACTIVE CUSTOMER LISTS PANEL */}
      <section className="w-full md:w-80 border-r border-ink/15 bg-white flex flex-col h-full shrink-0">
        
        {/* Search & Header */}
        <div className="p-4 border-b border-ink/5 space-y-3">
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight text-ink flex items-center gap-2">
              <MessageCircle size={18} className="text-[var(--color-teal)]" />
              <span>Customer Inbox</span>
            </h1>
            <p className="text-[11px] text-ink/40 mt-0.5">Realtime communication stream hub.</p>
          </div>
          
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input 
              type="text"
              placeholder="Search customer threads..."
              className="w-full bg-gray-50 border border-ink/10 text-[11px] rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-ink/30"
            />
          </div>
        </div>

        {/* Thread listings cards */}
        <div className="flex-1 overflow-y-auto divide-y divide-ink/5">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setActiveThread(thread)}
              className={`w-full text-left p-4 flex items-start gap-3 transition-colors hover:bg-gray-50/50 ${
                activeThread.id === thread.id ? 'bg-gray-50' : ''
              }`}
            >
              <div className="bg-ink/5 w-9 h-9 rounded-full flex items-center justify-center text-ink/50 shrink-0 border border-ink/5">
                <User size={15} />
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex justify-between items-baseline">
                  <span className={`text-xs truncate block ${thread.unread ? 'font-bold text-ink' : 'font-medium text-ink/70'}`}>
                    {thread.customerName}
                  </span>
                  <span className="text-[9px] text-ink/40 font-mono shrink-0">{thread.time}</span>
                </div>
                <p className={`text-[11px] truncate leading-tight ${thread.unread ? 'font-semibold text-ink/80' : 'text-ink/40'}`}>
                  {thread.lastMessage}
                </p>
              </div>
              {thread.unread && (
                <span className="w-2 h-2 bg-[var(--color-teal)] rounded-full self-center shrink-0" />
              )}
            </button>
          ))}
        </div>

      </section>

      {/* RIGHT COLUMN: INTEGRATED CONSOLE INTERFACE */}
      <section className="flex-1 bg-paper flex flex-col h-full relative justify-between">
        
        {/* Active conversation title header info bar */}
        <div className="bg-white border-b border-ink/10 p-4 flex justify-between items-center z-10 shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[var(--color-teal)] rounded-full animate-pulse" />
            <h2 className="text-xs font-bold text-ink font-mono uppercase tracking-wider">
              Active Session: {activeThread.customerName}
            </h2>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] text-teal font-medium bg-[var(--color-teal-light)] px-2 py-0.5 rounded-full font-mono">
            <ShieldCheck size={11} /> Secured Room
          </span>
        </div>

        {/* Embedded Chat Logging Interface Messaging Logs Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-3 flex flex-col justify-end bg-gray-50/30">
          {currentMessages.map((msg, index) => {
            const isMe = msg.sender === 'Seller';
            return (
              <div
                key={index}
                className={`max-w-[70%] p-3 rounded-2xl border text-xs font-medium leading-relaxed ${
                  isMe 
                    ? 'bg-ink text-paper border-ink/5 ml-auto shadow-sm' 
                    : 'bg-white text-ink border-ink/10 mr-auto'
                }`}
              >
                <p className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 opacity-60 ${isMe ? 'text-paper/60' : 'text-ink/40'}`}>
                  {msg.sender}
                </p>
                <p className="break-words font-body font-medium">{msg.text}</p>
              </div>
            );
          })}
        </div>

        {/* Inline Dashboard Chat Input Box Footer */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-ink/10 flex gap-2 shrink-0">
          <input 
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Reply to ${activeThread.customerName}...`}
            className="flex-1 bg-gray-50 border border-ink/10 text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-ink/30 text-ink font-medium"
          />
          <button 
            type="submit"
            className="bg-ink hover:bg-ink/90 text-paper px-4 rounded-xl text-xs font-semibold flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <Send size={14} />
          </button>
        </form>

      </section>

    </main>
  );
}
