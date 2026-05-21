"use client";

import { useState, useEffect, useRef } from "react";
import { sendMessage } from "@/app/actions/chat";
import { supabase } from "@/lib/supabaseClient";
import { Send } from "lucide-react";

export default function ChatWindow({ 
  initialMessages, 
  conversationId, 
  currentUser, 
  chatName, 
  chatImage 
}: { 
  initialMessages: any[]; 
  conversationId: string; 
  currentUser: any; 
  chatName: string; 
  chatImage: string | null | undefined;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll ke bawah
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!supabase) return;

    // 1. Subscribe ke pesan baru via Supabase Realtime
    const messageChannel = supabase
      .channel(`realtime-messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `conversationId=eq.${conversationId}`,
        },
        (payload) => {
          // Ketika ada pesan baru di DB, tambahkan ke state jika bukan dari kita (karena state kita update optimistic atau dari server action)
          // Payload tidak memiliki relasi user (sender), jadi sebaiknya kita fetch atau buat format standar.
          // Untuk amannya, karena payload mentah dari DB, kita hanya akan masukkan jika sender !== currentUser
          if (payload.new.senderId !== currentUser.id) {
            // Karena payload tidak bawa tabel join, kita asumsikan namanya dari chatName (untuk 1-on-1)
            const incomingMsg = {
              ...payload.new,
              sender: { id: payload.new.senderId, name: chatName, image: chatImage }
            };
            setMessages((prev) => [...prev, incomingMsg]);
          }
        }
      )
      .subscribe();

    // 2. Presence untuk Online status di percakapan ini
    const presenceChannel = supabase.channel(`presence-${conversationId}`);
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        // Cek apakah ada user selain kita di room ini
        const otherUsersPresent = Object.keys(state).some(key => {
          const presences = state[key] as any[];
          return presences.some(p => p.userId !== currentUser.id);
        });
        setIsOnline(otherUsersPresent);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            userId: currentUser.id,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase?.removeChannel(messageChannel);
      supabase?.removeChannel(presenceChannel);
    };
  }, [conversationId, currentUser.id, chatName, chatImage]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage("");

    // Optimistic UI update
    const optimisticMsg = {
      id: Math.random().toString(),
      content: content,
      createdAt: new Date().toISOString(),
      senderId: currentUser.id,
      sender: { id: currentUser.id, name: currentUser.name, image: currentUser.image }
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    const res = await sendMessage(conversationId, content);
    if (res.error) {
      console.error(res.error);
      // Revert if error
      setMessages((prev) => prev.filter(m => m.id !== optimisticMsg.id));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Chat */}
      <div className="p-4 border-b border-white/10 flex items-center bg-black/30 backdrop-blur-md">
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-700 mr-3 flex-shrink-0">
          {chatImage ? (
            <img src={chatImage} alt={chatName} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50 text-lg font-bold">
              {chatName.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-white font-semibold">{chatName}</h3>
          {isOnline ? (
            <div className="flex items-center text-xs text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
              Online
            </div>
          ) : (
            <div className="text-xs text-white/40">Offline</div>
          )}
        </div>
      </div>

      {/* Area Pesan */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div key={msg.id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[70%] ${isMe ? "flex-row-reverse" : "flex-row"} items-end`}>
                {!isMe && (
                  <img 
                    src={msg.sender?.image || `https://ui-avatars.com/api/?name=${msg.sender?.name}&background=random`} 
                    alt="avatar" 
                    className="w-6 h-6 rounded-full mb-1 mx-2"
                  />
                )}
                <div 
                  className={`p-3 rounded-2xl ${
                    isMe 
                      ? "bg-blue-600 text-white rounded-br-none" 
                      : "bg-white/10 text-white rounded-bl-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <div className={`text-[10px] mt-1 ${isMe ? "text-blue-200 text-right" : "text-white/40 text-left"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Chat */}
      <div className="p-4 bg-black/30 border-t border-white/10">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
