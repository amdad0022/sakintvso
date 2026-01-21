
import React from 'react';
import { Agent, User, UserRole } from '../types';

interface DueDetailsScreenProps {
  user: User | null;
  agents: Agent[];
  onEdit: (id: string) => void;
  onReset: (id: string) => void;
  onBack: () => void;
}

const DueDetailsScreen: React.FC<DueDetailsScreenProps> = ({ user, agents, onEdit, onReset, onBack }) => {
  const isMaster = user?.role === UserRole.MASTER;
  const agentsWithDue = agents.filter(a => a.currentDue !== 0);
  const totalDueSum = agentsWithDue.reduce((sum, a) => sum + a.currentDue, 0);

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden animate-in slide-in-from-right duration-500 font-sans">
      {/* PINK HEADER */}
      <header className="px-6 pt-10 pb-8 bg-[#E2136E] border-b border-rose-600 flex items-center gap-6 shrink-0 z-30 shadow-xl">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-[#E2136E] active:scale-90 transition-all shadow-lg font-black text-xl">◀️</button>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight uppercase">Liability Map</h1>
          <p className="text-[10px] text-white/70 font-bold uppercase tracking-[0.3em] mt-1">Outstanding Market Exposure</p>
        </div>
      </header>

      <div className="px-6 py-8 bg-white shrink-0 border-b border-slate-100">
        <div className="bg-slate-900 rounded-[36px] p-8 shadow-2xl flex justify-between items-center relative overflow-hidden ring-4 ring-slate-50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[80px]"></div>
          <div>
            <p className="text-indigo-100/40 text-[9px] font-black uppercase tracking-[0.4em] mb-2">Total DUE</p>
            <p className="text-4xl font-black text-white tracking-tighter leading-none">৳{totalDueSum.toLocaleString()}</p>
          </div>
          <div className="text-right">
             <div className="w-14 h-14 bg-white/10 rounded-[22px] flex flex-col items-center justify-center border border-white/20">
               <span className="text-white text-xl font-black">{agentsWithDue.length}</span>
               <span className="text-indigo-100/40 text-[7px] font-black uppercase">Active</span>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-24 custom-scrollbar">
        {agentsWithDue.length > 0 ? (
          agentsWithDue.map(agent => (
            <div key={agent.id} className="bg-white rounded-[40px] p-7 border border-slate-100 shadow-sm flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-black text-slate-800 text-[17px] leading-tight uppercase">{agent.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{agent.mobile}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-black tracking-tighter ${agent.currentDue > 0 ? 'text-[#E2136E]' : 'text-emerald-500'}`}>৳{Math.abs(agent.currentDue).toLocaleString()}</p>
                  <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${agent.currentDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{agent.currentDue > 0 ? 'DEBIT' : 'CREDIT'}</span>
                </div>
              </div>

              <div className={`grid ${isMaster ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                <button onClick={() => onEdit(agent.id)} className={`py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-xl ${isMaster ? 'bg-[#E2136E] text-white shadow-rose-200' : 'bg-slate-900 text-white shadow-slate-200'}`}>
                  {isMaster ? 'Open Audit Ledger' : 'Manage History'}
                </button>
                {!isMaster && (
                  <button onClick={() => onReset(agent.id)} className="bg-rose-50 text-[#E2136E] py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-rose-100 active:scale-95 transition-all">Clear Acc</button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20 py-24 text-center">
             <div className="text-6xl mb-6">📊</div>
             <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-900">Market Exposure: Zero</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DueDetailsScreen;
