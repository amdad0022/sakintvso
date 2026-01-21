
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, ChatMessage, UserRole } from '../types';

interface CommunityChatScreenProps {
  user: User;
  allUsers: User[];
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onBack: () => void;
}

const CommunityChatScreen: React.FC<CommunityChatScreenProps> = ({ user, allUsers, messages, onSendMessage, onBack }) => {
  const [inputText, setInputText] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputText(value);

    const lastWord = value.split(' ').pop() || '';
    if (lastWord.startsWith('@')) {
      setShowMentions(true);
      setMentionSearch(lastWord.slice(1));
    } else {
      setShowMentions(false);
    }
  };

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
      setShowMentions(false);
    }
  };

  const insertMention = (name: string) => {
    const words = inputText.split(' ');
    words.pop();
    const newValue = [...words, `@${name}`, ''].join(' ');
    setInputText(newValue);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const dsoList = useMemo(() => {
    return allUsers.filter(u => 
      u.role === UserRole.DSO && 
      u.name.toLowerCase().includes(mentionSearch.toLowerCase())
    );
  }, [allUsers, mentionSearch]);

  const renderTextWithMentions = (text: string) => {
    const words = text.split(' ');
    return words.map((word, i) => {
      if (word.startsWith('@')) {
        return <span key={i} className="text-yellow-400 font-black mr-1 drop-shadow-sm">{word}</span>;
      }
      return word + ' ';
    });
  };

  const getRoleStyle = (role: UserRole) => {
    switch (role) {
      case UserRole.MASTER: return { bg: 'bg-indigo-600', text: 'Distributor', gradient: 'from-indigo-700 to-indigo-900', ring: 'ring-amber-400/30' };
      case UserRole.ADMIN: return { bg: 'bg-slate-900', text: 'Admin', gradient: 'from-slate-800 to-slate-950', ring: 'ring-slate-400/20' };
      default: return { bg: 'bg-[#E2136E]', text: 'DSO', gradient: 'from-[#E2136E] to-[#C1105E]', ring: 'ring-pink-400/20' };
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F1F5F9] overflow-hidden relative font-sans">
      {/* GLOBAL STATUS BAR */}
      <div className="bg-slate-900 text-[8px] text-white py-1 px-4 flex items-center justify-center gap-2 uppercase tracking-[0.3em] font-black z-[60]">
        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
        Global Distribution Network Active
      </div>

      {/* HEADER */}
      <header className="px-6 py-6 flex items-center justify-between shrink-0 z-50 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-11 h-11 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 active:scale-90 transition-all shadow-sm">
            ←
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Community Hub</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Shared Coordination Room</p>
          </div>
        </div>
        <div className="flex items-center">
            <div className="flex -space-x-3">
              {allUsers.slice(0, 3).map((u, i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm uppercase">
                  {u.name.charAt(0)}
                </div>
              ))}
            </div>
            {allUsers.length > 3 && (
              <span className="ml-2 text-[9px] font-black text-slate-300">+{allUsers.length - 3}</span>
            )}
        </div>
      </header>

      {/* MESSAGE FEED */}
      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6 z-10 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 px-10 text-center">
            <div className="w-28 h-28 bg-white rounded-[44px] shadow-sm flex items-center justify-center text-6xl mb-6">🛰️</div>
            <p className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Ready for Broadcast</p>
            <p className="text-[10px] font-medium text-slate-400 mt-3 leading-relaxed max-w-[200px]">
              Messages sent here are visible to all staff, admins, and distributors.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === user.id;
            const roleStyle = getRoleStyle(msg.senderRole);
            const showSender = idx === 0 || messages[idx-1].senderId !== msg.senderId;

            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                {!isMe && (
                   <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-xs font-black text-slate-400 shrink-0 uppercase">
                     {msg.senderName.charAt(0)}
                   </div>
                )}
                
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                  {showSender && (
                    <div className={`flex items-center gap-2 mb-2 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{isMe ? 'YOU (SESSION)' : msg.senderName}</span>
                      <span className={`text-[8px] font-black text-white ${roleStyle.bg} px-2.5 py-0.5 rounded-full uppercase tracking-tighter ring-2 ${roleStyle.ring}`}>
                        {roleStyle.text}
                      </span>
                    </div>
                  )}
                  
                  <div className={`p-4 shadow-xl relative overflow-hidden ${
                    isMe 
                    ? `bg-gradient-to-br ${roleStyle.gradient} text-white rounded-[28px] rounded-br-none` 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-[28px] rounded-bl-none shadow-sm'
                  }`}>
                    {/* ACCENT FOR DISTRIBUTOR MESSAGES */}
                    {msg.senderRole === UserRole.MASTER && (
                      <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 rounded-bl-full pointer-events-none"></div>
                    )}

                    <p className="text-sm font-medium leading-relaxed tracking-tight">
                      {renderTextWithMentions(msg.text)}
                    </p>
                    <div className={`flex items-center gap-1.5 mt-2.5 opacity-50 ${isMe ? 'justify-end text-white' : 'justify-start text-slate-400'}`}>
                      <span className="text-[7px] font-black uppercase tracking-[0.2em]">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && <span className="text-[10px]">✓✓</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* MENTION SUGGESTIONS */}
      {showMentions && dsoList.length > 0 && (
        <div className="absolute bottom-[100px] left-6 right-6 bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-[100] animate-in slide-in-from-bottom-6 duration-300">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Notification</p>
            <span className="text-[8px] font-bold text-slate-300">@{mentionSearch}</span>
          </div>
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
            {dsoList.map(dso => (
              <button 
                key={dso.id}
                onClick={() => insertMention(dso.name)}
                className="w-full flex items-center gap-4 p-5 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-[14px] flex items-center justify-center text-[10px] font-black uppercase border border-pink-100">
                  {dso.name.charAt(0)}
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-black text-slate-900 leading-none">{dso.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{dso.mobile}</p>
                </div>
                <span className="text-xs text-slate-200">➕</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MESSAGE INPUT */}
      <div className="p-6 bg-white border-t border-slate-100 shrink-0 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
        <div className="relative flex items-center gap-3">
          <div className="flex-1 relative">
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Broadcast a message... (Use @ to tag)"
              value={inputText}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-slate-50 border border-slate-100 rounded-[28px] pl-7 pr-14 py-5 outline-none font-bold text-slate-800 focus:ring-8 focus:ring-slate-900/5 transition-all text-sm placeholder:text-slate-300"
            />
            {inputText && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                 <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl shadow-slate-200 active:scale-90 transition-all disabled:opacity-20 disabled:grayscale"
          >
            <span className="text-xl -mt-0.5 ml-1">🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityChatScreen;
