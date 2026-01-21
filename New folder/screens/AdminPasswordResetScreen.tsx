
import React, { useState } from 'react';

interface AdminPasswordResetScreenProps {
  onReset: (current: string, next: string) => void;
  onBack: () => void;
}

const AdminPasswordResetScreen: React.FC<AdminPasswordResetScreenProps> = ({ onReset, onBack }) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);

    if (!current || !next || !confirm) {
      setError("All fields are required.");
      return;
    }

    if (next !== confirm) {
      setError("New passwords do not match.");
      return;
    }

    if (next.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    onReset(current, next);
  };

  return (
    <div className="flex flex-col h-full bg-[#FBFCFE] overflow-hidden">
      <header className="p-6 bg-white border-b border-slate-100 flex items-center gap-4 shrink-0">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-500 active:scale-90 transition-all">
          ←
        </button>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Security Reset</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="bg-slate-900 rounded-[32px] p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-[40px]"></div>
          <h3 className="text-white font-black text-sm uppercase tracking-widest mb-1 relative z-10">Admin Access Recovery</h3>
          <p className="text-slate-400 text-[10px] leading-relaxed font-medium relative z-10">
            For system integrity, you must verify your identity by entering your existing password before setting a new one.
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Current Password</label>
            <div className="relative">
              <input 
                type="password" 
                placeholder="••••••••"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="w-full bg-white border border-slate-100 rounded-[24px] px-6 py-5 outline-none font-bold text-slate-800 focus:ring-4 focus:ring-slate-900/5 transition-all text-sm"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">🗝️</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">New Secure Password</label>
            <div className="relative">
              <input 
                type="password" 
                placeholder="••••••••"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                className="w-full bg-white border border-slate-100 rounded-[24px] px-6 py-5 outline-none font-bold text-slate-800 focus:ring-4 focus:ring-slate-900/5 transition-all text-sm"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">✨</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Confirm New Password</label>
            <div className="relative">
              <input 
                type="password" 
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-white border border-slate-100 rounded-[24px] px-6 py-5 outline-none font-bold text-slate-800 focus:ring-4 focus:ring-slate-900/5 transition-all text-sm"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">✅</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-[10px] font-black uppercase tracking-widest text-center animate-bounce">
              ⚠️ {error}
            </div>
          )}

          <button 
            onClick={handleSubmit}
            className="w-full bg-[#E2136E] text-white font-black py-5 rounded-[28px] shadow-2xl shadow-pink-100 active:scale-95 transition-all text-sm uppercase tracking-widest mt-4"
          >
            Update My Password
          </button>
        </div>

        <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em] py-4">
          Changes take effect instantly
        </p>
      </div>
    </div>
  );
};

export default AdminPasswordResetScreen;
