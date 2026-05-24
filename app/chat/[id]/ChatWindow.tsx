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
      <div className="chat-header">
        <div className="chat-item-avatar">
          {chatImage ? (
            <img src={chatImage} alt={chatName} className="chat-item-avatar" />
          ) : (
            chatName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="chat-header-info">
          <h3>{chatName}</h3>
          {isOnline ? (
            <div className="chat-online">
              <span className="chat-online-dot"></span>
              Online
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Offline</div>
          )}
        </div>
      </div>

      {/* Area Pesan */}
      <div className="chat-messages">
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div key={msg.id || idx} className={`message-row ${isMe ? "me" : "them"}`}>
              {!isMe && (
                <img 
                  src={msg.sender?.image || `https://ui-avatars.com/api/?name=${msg.sender?.name}&background=random`} 
                  alt="avatar" 
                  className="message-avatar"
                />
              )}
              <div className="message-bubble">
                {msg.content}
                <span className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Chat */}
      <div className="chat-input-area">
        <form onSubmit={handleSend} className="chat-input-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tulis pesan..."
            className="chat-input-field"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="chat-send-btn"
          >
            <Send size={20} className={newMessage.trim() ? "translate-x-[2px]" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
}
