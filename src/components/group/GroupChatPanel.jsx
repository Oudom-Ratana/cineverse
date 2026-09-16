import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, CheckCircle, Clock, Shield, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { sendGroupChatMessage, listenGroupChat } from '../../services/firestoreService';

export default function GroupChatPanel({
  groupId,
  isLeader = false,
  members = [],
  onLeaderProceed,
  selectedSeatsCount = 0,
}) {
  const { user } = useAuth();
  const { toggleReady } = useWebSocket();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isReady, setIsReady] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!groupId) return;
    const unsubscribe = listenGroupChat(groupId, (msgs) => {
      setMessages(msgs);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      userId: user?.uid || 'guest',
      userName: user?.displayName || 'Cinephile Member',
      userPhoto: user?.photoURL || null,
      text: inputText.trim(),
    };

    setInputText('');
    await sendGroupChatMessage(groupId, newMsg);
  };

  const handleToggleReady = () => {
    setIsReady(!isReady);
    toggleReady();
  };

  return (
    <div className="flex flex-col h-[560px] bg-dark-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800 bg-dark-950/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <h4 className="font-bold text-sm text-white">Live Group Lounge</h4>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{members.length} Connected</span>
        </div>
      </div>

      {/* Active Member Roster */}
      <div className="px-4 py-2.5 bg-dark-950/40 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {members.map((m, idx) => (
          <div
            key={m.uid || idx}
            className="flex-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs"
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: m.color || '#06b6d4' }}
            />
            <span className="font-medium text-slate-200 text-[11px] truncate max-w-[80px]">
              {m.displayName || 'Member'}
            </span>
            {m.isReady && <CheckCircle className="w-3 h-3 text-emerald-400" />}
          </div>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-500 p-4">
            <Sparkles className="w-6 h-6 text-cyan-500/50 mb-2" />
            <p>Welcome to the group session!</p>
            <p className="mt-1">Discuss seats, snacks, or coordinate showtimes here.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.userId === user?.uid;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {!isMe && (
                  <span className="text-[10px] text-slate-400 font-semibold mb-0.5 ml-1">
                    {msg.userName}
                  </span>
                )}
                <div
                  className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-rose-600 text-white rounded-br-sm shadow-md'
                      : 'bg-slate-800 text-slate-200 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Synchronized Checkout Controls */}
      <div className="p-3 bg-dark-950 border-t border-slate-800 space-y-2.5">
        <div className="flex items-center gap-2">
          {/* Member Ready Checkbox */}
          <button
            onClick={handleToggleReady}
            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              isReady
                ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <CheckCircle className={`w-3.5 h-3.5 ${isReady ? 'text-emerald-400' : 'text-slate-500'}`} />
            {isReady ? 'I Am Ready' : 'Mark Ready'}
          </button>

          {/* Group Leader Proceed Button */}
          {isLeader && (
            <button
              onClick={onLeaderProceed}
              disabled={selectedSeatsCount === 0}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-950 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              Leader Proceed
            </button>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-dark-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition shadow"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
