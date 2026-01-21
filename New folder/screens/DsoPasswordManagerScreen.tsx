
import React, { useState } from 'react';
import { User } from '../types';

interface DsoPasswordManagerScreenProps {
  dsos: User[];
  onUpdatePassword: (userId: string, newPass: string) => void;
  onBack: () => void;
}

const DsoPasswordManagerScreen: React.FC<DsoPasswordManagerScreenProps> = ({ dsos, onUpdatePassword, onBack }) => {
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ id: string, message: string, type: 'success' | 'error' } | null>(null);

  const handleUpdate = (userId: string) => {
    const newPass = passwords[userId]?.trim();
    
    if (!newPass) {
      setStatus({ id: userId, message: "Password cannot be empty", type: 'error' });
      return;
    }

    if (newPass.length < 4) {
      setStatus({ id: userId, message: "Minimum 4 characters required", type: 'error' });
      return;
    }

    onUpdatePassword(userId, newPass);
    setStatus({ id: userId, message: "Updated successfully", type: 'success' });
    
    // Clear the input field for that user
    setPasswords(prev => ({ ...prev, [userId]: '' }));

    // Clear status after delay
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-[#FBFCFE] overflow-hidden">
      <header className="p-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-500 active:scale-90 transition-all">
            ←
          </button>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Security Center</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-indigo-50 rounded-[32px] p-6 border border-indigo-100">
          <h3 className="text-indigo-900 font-black text-sm uppercase tracking-widest mb-1">DSO Credential Control</h3>
          <p className="text-indigo-700/70 text-[10px] leading-relaxed font-medium">
            Authorized administrators can update distribution officer passwords. Changes take effect immediately.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Registered Distribution Officers</p>
          
          <div className="space-y-4">
            {dsos.map(dso => (
              <div key={dso.id} className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-black text-slate-800">{dso.name}</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{dso.mobile}</p>
                  </div>
                  <span className="bg-slate-50 text-slate-400 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">DSO Account</span>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Enter new secure password"
                      value={passwords[dso.id] || ''}
                      onChange={(e) => setPasswords(prev => ({ ...prev, [dso.id]: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 transition-all text-xs"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg opacity-20">🔑</span>
                  </div>

                  <button 
                    onClick={() => handleUpdate(dso.id)}
                    className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl active:scale-[0.98] transition-all text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-slate-200"
                  >
                    Update Password
                  </button>

                  {status?.id === dso.id && (
                    <p className={`text-center text-[9px] font-black uppercase tracking-widest animate-in slide-in-from-top-2 ${status.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {status.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em] py-8">
          End-to-End Encryption Simulated
        </p>
      </div>
    </div>
  );
};

export default DsoPasswordManagerScreen;
