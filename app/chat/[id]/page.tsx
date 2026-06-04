'use client';

import { createClient } from '@/utils/supabase/client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';

export default function ChatRoomPage({ params }: { params: { id: string } }) {
  const { id: orderId } = params;
  const router = useRouter();
  const supabase = createClient();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Auto-scroll to the newest message
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Get the current user
    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      // 2. Fetch existing chat history for this specific order
      const { data: history } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:sender_id ( full_name, role )
        `)
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (history) setMessages(history);
      setIsLoading(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    setup();

    // 3. Subscribe to Realtime new messages
    const channel = supabase
      .channel(`room_${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${orderId}`,
        },
        async (payload) => {
          // When a new message hits the DB, fetch the sender's profile and append it
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', payload.new.sender_id)
            .single();
            
          const completeMessage = { ...payload.new, profiles: profile };
          
          setMessages((prev) => [...prev, completeMessage]);
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      )
      .subscribe();

    // Cleanup subscription when the user leaves the page
    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, router, supabase]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    const textToSend = newMessage.trim();
    setNewMessage(''); // Clear input instantly for snappy UI feel

    // Insert into Supabase (The Realtime channel will pick it up and render it)
    await supabase.from('messages').insert({
      order_id: orderId,
      sender_id: userId,
      text: textToSend,
    });
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">Loading Secure Chat...</div>;

  return (
    <div className="flex flex-col h-screen bg-[#f8f9fa] text-[#1f2937]">
      {/* HEADER */}
      <header className="flex-none flex items-center gap-4 px-6 py-5 bg-white border-b border-gray-200 shadow-sm z-10">
        <button onClick={() => router.back()} className="p-2 bg-gray-50 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 leading-tight">Order Chat</h2>
          <p className="text-xs text-green-600 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Live Connection
          </p>
        </div>
      </header>

      {/* CHAT MESSAGES AREA */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar bg-gray-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <p className="font-medium text-sm">No messages yet.</p>
            <p className="text-xs mt-1">Start the conversation to coordinate delivery!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === userId;
            const senderName = msg.profiles?.full_name || 'User';
            const senderRole = msg.profiles?.role || 'student';

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && (
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1 flex items-center gap-1">
                    {senderName} 
                    {senderRole === 'rider' && <span className="bg-[#8a1515] text-white px-1.5 py-0.5 rounded text-[8px]">Rider</span>}
                  </span>
                )}
                <div 
                  className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm shadow-sm ${
                    isMe 
                      ? 'bg-[#8a1515] text-white rounded-br-sm' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-gray-400 mt-1 font-medium">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* MESSAGE INPUT */}
      <footer className="flex-none bg-white border-t border-gray-200 p-4 pb-safe">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-2">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..." 
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8a1515] transition-all"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="bg-[#8a1515] text-white p-3 rounded-full hover:bg-[#6f1111] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center flex-shrink-0"
          >
            <Send size={20} />
          </button>
        </form>
      </footer>
    </div>
  );
}