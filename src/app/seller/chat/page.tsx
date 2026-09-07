 // src/app/seller/chat/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import { MessageCircle, Search, User, ShieldCheck, Send, RefreshCw, AlertCircle } from 'lucide-react';

interface ChatRoom {
  id: string;
  customer_name: string;
  last_message: string | null;
  last_message_at: string;
  unread_by_seller: boolean;
}

interface ChatMessage {
  id: string;
  room_id: string;
  sender_type: 'customer' | 'seller';
  message_text: string;
  created_at: string;
}

export default function SellerChatPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Core Data States
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [storeId, setStoreId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-scroll utility function para sa chat log window viewport
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. DATA CORE STREAM LOGIC: Kunin ang store id at i-reconstruct ang real-time rooms feed
  useEffect(() => {
    let roomsRealtimeSubscription: any;

    const fetchChatRooms = async () => {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        if (storeError || !storeData) {
          throw new Error('Hindi nahanap ang profile parameters ng iyong tindahan.');
        }

        setStoreId(storeData.id);

        // Hahatakin ang lahat ng active customer conversation rooms ng tindahang ito
        const { data: chatRooms, error: roomsError } = await supabase
          .from('chat_rooms')
          .select('id, customer_name, last_message, last_message_at, unread_by_seller')
          .eq('store_id', storeData.id)
          .order('last_message_at', { ascending: false });

        if (roomsError) throw roomsError;
        setRooms(chatRooms || []);
        if (chatRooms && chatRooms.length > 0) {
          setActiveRoom(chatRooms[0]);
        }

        // ⚡ INAYOS NA SECURE LISTENERS: Nakakadena ang .on() BAGO ang .subscribe() para iwas crash rule logic
        roomsRealtimeSubscription = supabase
          .channel('public:chat_rooms')
          .on(
            'postgres_changes', 
            { event: '*', schema: 'public', table: 'chat_rooms', filter: `store_id=eq.${storeData.id}` }, 
            (payload: any) => {
              if (payload.eventType === 'INSERT') {
                setRooms(prev => [payload.new as ChatRoom, ...prev]);
              } else if (payload.eventType === 'UPDATE') {
                setRooms(prev => prev.map(r => r.id === payload.new.id ? { ...r, ...payload.new } : r).sort((a,b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()));
              }
            }
          )
          .subscribe();

      } catch (err: any) {
        console.error('Error establishing live chat connections:', err.message);
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
    return () => {
      if (roomsRealtimeSubscription) supabase.removeChannel(roomsRealtimeSubscription);
    };
  }, [router]);

  // 2. MESSAGES LOADER & REAL-TIME LISTENER: Tumatakbo tuwing nagpapalit ng active customer room card
  useEffect(() => {
    if (!activeRoom) return;
    let messagesSubscription: any;

    const fetchRoomMessages = async () => {
      try {
        setLoadingMessages(true);
        
        // Mark room as read by seller once clicked
        if (activeRoom.unread_by_seller) {
          await supabase.from('chat_rooms').update({ unread_by_seller: false }).eq('id', activeRoom.id);
        }

        const { data, error } = await supabase
          .from('chat_messages')
          .select('id, room_id, sender_type, message_text, created_at')
          .eq('room_id', activeRoom.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);

        // ⚡ LIVE MESSAGES REAL-TIME LISTENER: Tumatakbo ang .on() at nakasulat bago ang pangwakas na .subscribe()
        messagesSubscription = supabase
          .channel(`public:chat_messages:${activeRoom.id}`)
          .on(
            'postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${activeRoom.id}` }, 
            (payload: any) => {
              setMessages(prev => [...prev, payload.new as ChatMessage]);
            }
          )
          .subscribe();

      } catch (err) {
        console.error('Error fetching chat histories:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchRoomMessages();
    return () => {
      if (messagesSubscription) supabase.removeChannel(messagesSubscription);
    };
  }, [activeRoom]);

  // 3. ACTION CONTROLLER SEND BUTTON: Nagpapadala ng reply text message row sa database
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeRoom || isSubmitting) return;

    const currentText = replyText.trim();
    setReplyText('');
    setIsSubmitting(true);

    try {
      // A. I-insert ang bagong bubble message
      const { error: msgError } = await supabase
        .from('chat_messages')
        .insert([{ room_id: activeRoom.id, sender_type: 'seller', message_text: currentText }]);

      if (msgError) throw msgError;

      // B. I-update ang last message placeholder inside parent chat room details row
      await supabase
        .from('chat_rooms')
        .update({ last_message: currentText, last_message_at: new Date().toISOString(), unread_by_seller: false })
        .eq('id', activeRoom.id);

    } catch (err: any) {
      console.error('Error emitting live text stream parameter:', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col md:flex-row h-screen bg-paper text-ink font-body overflow-hidden animate-in fade-in duration-300">
      
      {/* LEFT COLUMN: ACTIVE CUSTOMER LISTS PANEL */}
      <section className="w-full md:w-80 border-r border-ink/15 bg-white flex flex-col h-full shrink-0">
        
        {/* Search & Header */}
        <div className="p-4 border-b border-ink/5 space-y-3">
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight text-ink flex items-center gap-2">
              <MessageCircle size={18} className="text-teal" />
              <span>Customer Inbox</span>
            </h1>
            <p className="text-[11px] text-ink/40 mt-0.5">Realtime communication stream hub.</p>
          </div>
          
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input 
              type="text"
              placeholder="Search customer threads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-ink/10 text-[11px] rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-ink/30 text-ink font-medium"
            />
          </div>
        </div>

        {/* ERROR NOTIFIER */}
        {errorMessage && (
          <div className="p-3 mx-4 mt-2 bg-rose-50 border border-rose-100 rounded-xl text-[10px] text-rose-800 font-medium flex items-center gap-1.5">
            <AlertCircle size={12} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Thread listings cards */}
        <div className="flex-1 overflow-y-auto divide-y divide-ink/5">
          {loading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-xs font-medium text-ink/40 animate-pulse">
              <RefreshCw size={14} className="animate-spin text-ink/20" />
              <span>Loading channels...</span>
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-8 text-center text-xs text-ink/40 font-medium space-y-1">
              <p>No active chat rooms</p>
              <p className="text-[10px] text-ink/30 font-normal">Customer messages will record live here.</p>
            </div>
          ) : (
            rooms
              .filter(r => r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((room) => (
                <button
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  className={`w-full text-left p-4 flex items-start gap-3 transition-colors hover:bg-gray-50/50 cursor-pointer ${
                    activeRoom?.id === room.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="bg-ink/5 w-9 h-9 rounded-full flex items-center justify-center text-ink/50 shrink-0 border border-ink/5 shadow-inner">
                    <User size={15} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex justify-between items-baseline">
                      <span className={`text-xs truncate block ${room.unread_by_seller ? 'font-bold text-ink' : 'font-medium text-ink/70'}`}>
                        {room.customer_name}
                      </span>
                      <span className="text-[9px] text-ink/40 font-mono shrink-0">
                        {room.last_message_at ? new Date(room.last_message_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className={`text-[11px] truncate leading-tight ${room.unread_by_seller ? 'font-bold text-ink/80' : 'text-ink/40'}`}>
                      {room.last_message || 'Started a new conversation.'}
                    </p>
                  </div>
                  {room.unread_by_seller && (
                    <span className="w-2 h-2 bg-teal rounded-full self-center shrink-0 animate-pulse" />
                  )}
                </button>
              ))
          )}
        </div>

      </section>

      {/* RIGHT COLUMN: INTEGRATED CONSOLE INTERFACE */}
      <section className="flex-1 bg-paper flex flex-col h-full relative justify-between">
        
        {activeRoom ? (
          <>
            {/* Active conversation title header info bar */}
            <div className="bg-white border-b border-ink/10 p-4 flex justify-between items-center z-10 shadow-xs shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-teal rounded-full animate-pulse" />
                <h2 className="text-xs font-bold text-ink font-mono uppercase tracking-wider">
                  Active Session: {activeRoom.customer_name}
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] text-teal font-semibold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-mono select-none">
                <ShieldCheck size={11} /> Secured Room
              </span>
            </div>

            {/* Embedded Chat Logging Interface Messaging Logs Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-3 flex flex-col bg-gray-50/20">
              {loadingMessages ? (
                <div className="my-auto mx-auto flex items-center gap-2 text-xs font-medium text-ink/40 animate-pulse">
                  <RefreshCw size={14} className="animate-spin text-ink/20" />
                  <span>Loading chat message tokens...</span>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_type === 'seller';
                  return (
                    <div
                      key={msg.id}
                      className={`max-w-[70%] p-3 rounded-2xl border text-xs font-medium leading-relaxed shadow-xs ${
                        isMe 
                          ? 'bg-ink text-paper border-ink/5 ml-auto rounded-tr-none' 
                          : 'bg-white text-ink border-ink/10 mr-auto rounded-tl-none'
                      }`}
                    >
                      <p className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 opacity-60 select-none ${isMe ? 'text-paper/50' : 'text-ink/40'}`}>
                        {isMe ? 'You (Seller)' : 'Customer'}
                      </p>
                      <p className="break-words font-body font-medium select-text">{msg.message_text}</p>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Inline Dashboard Chat Input Box Footer */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-ink/10 flex gap-2 shrink-0 shadow-inner">
              <input 
                type="text"
                value={replyText}
                disabled={isSubmitting}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${activeRoom.customer_name}...`}
                className="flex-1 bg-gray-50 border border-ink/10 text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-ink/30 text-ink font-medium disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={!replyText.trim() || isSubmitting}
                className="bg-ink hover:bg-ink/90 text-paper px-4 rounded-xl text-xs font-semibold flex items-center justify-center transition active:scale-95 cursor-pointer disabled:opacity-40 shadow-xs"
              >
                <Send size={14} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-ink/40 space-y-2 select-none">
            <MessageCircle size={28} className="text-ink/10" strokeWidth={1.5} />
            <p className="font-semibold text-ink/60">No conversation selected</p>
            <p className="max-w-xs text-ink/40 font-normal leading-relaxed">Pumili ng active buyer message thread sa kaliwang panel upang simulan ang pakikipag-chat.</p>
          </div>
        )}

      </section>

    </main>
  );
}
