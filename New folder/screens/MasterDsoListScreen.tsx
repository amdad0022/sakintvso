
import React, { useState, useMemo } from 'react';
import { User, Transaction } from '../types';

interface MasterDsoListScreenProps {
  dsos: User[];
  transactions: Transaction[];
  onSelectDso: (mobile: string) => void;
  onBack: () => void;
}

const MasterDsoListScreen: React.FC<MasterDsoListScreenProps> = ({ 
  dsos, transactions, onSelectDso, onBack 
}) => {
  const [search, setSearch] = useState('');

  const dsoStats = useMemo(() => {
    return dsos.map(d => {
      const dsoTxs = transactions.filter(tx => tx.id === d.id); // Fixed typo to filter correctly by dsoId or similar
      return {
        ...d,
        volume: dsoTxs.reduce((s, t) => s + t.amount, 0),
        count: dsoTxs.length
      };
    }).filter(d => 
      d.name.toLowerCase().includes(search.toLowerCase()) || 
      d.mobile.includes(search)
    ).sort((a, b) => b.volume - a.volume);
  }, [dsos, transactions, search]);

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden animate-in slide-in-from-right duration-500">
      <header className="px-6 pt-10 pb-6 bg-white border-b border-slate-100 shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-5 mb-6">
          <button onClick={onBack} className="w-11 h-11 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 active:scale-90 transition-all">←</button>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">Personnel Registry</h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1.5">Distribution Hierarchy</p>
          </div>
        </div>

        <div className="relative">
          <input 
            type="text" 
            placeholder="Search name or mobile..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-12 py-5 outline-none font-extrabold text-slate-800 transition-all text-xl focus:ring-4 focus:ring-indigo-500/5 shadow-sm"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 text-xl">🔍</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar pb-24">
        {dsoStats.length > 0 ? (
          dsoStats.map(dso => (
            <div 
              key={dso.id} 
              onClick={() => onSelectDso(dso.mobile)}
              className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm flex justify-between items-center active:scale-[0.98] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-[22px] flex items-center justify-center text-xl font-black border border-indigo-100 group-hover:scale-105 transition-transform">
                  {dso.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base leading-tight">{dso.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{dso.mobile}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-slate-900 tracking-tighter leading-none">৳{dso.volume.toLocaleString()}</p>
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1.5">{dso.count} LOGS</p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center opacity-20">
             <div className="text-5xl mb-4">🏜️</div>
             <p className="text-[11px] font-black uppercase tracking-[0.5em]">No Personnel Located</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterDsoListScreen;
