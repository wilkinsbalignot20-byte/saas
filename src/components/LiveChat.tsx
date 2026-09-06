 'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, X, Send } from 'lucide-react';

export default function LiveChat({ storeId, isSeller = false }: { storeId?: string; isSeller?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ id: string; sender: string; text: string }[]>([]);
  const [inputText, setInputText] = useState('');

  // 1. BUHAYIN ANG SUPABASE REALTIME CHANNEL
  useEffect(() => {
    if (!storeId) return;

    // Gumawa ng real-time connection room base sa storeId ng tindahan
    const chatChannel = supabase
      .channel(`chat-${storeId}`)
      .on('broadcast', { event: 'shout' }, ({ payload }) => {
        // Kapag may sumigaw o nagpadala ng text sa channel, saluhin ito dito
        setMessages((prev) => [...prev, payload]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, [storeId]);

  // 2. MAGPADALA NG MENSAHE
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: Math.random().toString(),
      sender: isSeller ? 'Seller' : 'Customer',
      text: inputText,
    };

    // I-render agad sa sariling screen
    setMessages((prev) => [...prev, newMessage]);

    // I-broadcast sa Supabase Realtime para marinig ng kabilang panig
    await supabase.channel(`chat-${storeId}`).send({
      type: 'broadcast',
      event: 'shout',
      payload: newMessage,
    });

    setInputText('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-body select-none">
      {/* 💬 FLOATING CHAT BUTTON — Tailwind v4 modified state actions */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-ink text-paper rounded-xl shadow-lg flex items-center justify-center transition hover:bg-ink/90 active:scale-95 cursor-pointer"
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </button>

      {/* 🪟 CHAT WINDOW BOX */}
      {isOpen && (
        <div className="absolute bottom-18 right-0 w-80 h-96 bg-white border border-ink/10 rounded-2xl shadow-xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          {/* Header layout structure match */}
          <div className="bg-ink p-4 text-paper font-semibold flex justify-between items-center border-b border-ink/5">
            <div className="flex items-center gap-2">
              <MessageSquare size={15} className="text-[var(--color-teal)]" />
              <span className="text-xs font-display font-bold uppercase tracking-wider">Storefront Chat</span>
            </div>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-teal)]"></span>
            </span>
          </div>

          {/* Messages Logs Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-gray-50/50 text-xs">
            {messages.length === 0 ? (
              <p className="text-center text-ink/30 mt-24 px-4 leading-relaxed text-[11px]">
                Magtanong o mag-iwan ng mensahe sa tindahan upang masimulan ang real-time channel logs.
              </p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender === (isSeller ? 'Seller' : 'Customer');
                return (
                  <div
                    key={msg.id}
                    className={`max-w-[75%] p-2.5 rounded-xl border transition-all ${
                      isMe
                        ? 'bg-ink text-paper ml-auto border-ink/5 shadow-sm'
                        : 'bg-white text-ink mr-auto border-ink/10 shadow-xs'
                    }`}
                  >
                    <p className={`font-bold text-[9px] uppercase tracking-wide mb-0.5 ${isMe ? 'text-paper/50' : 'text-ink/40'}`}>
                      {msg.sender}
                    </p>
                    <p className="leading-relaxed break-words font-medium">{msg.text}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Text Input Footer Form */}
          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-ink/5 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-50 border border-ink/10 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-ink/30 text-ink font-medium"
            />
            <button 
              type="submit" 
              className="bg-ink hover:bg-ink/90 text-paper px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center transition active:scale-95 cursor-pointer shadow-xs"
            >
              <Send size={12} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
