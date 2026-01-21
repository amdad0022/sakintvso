
import React, { useState } from 'react';
import { Agent, Transaction, TransactionType, User, UserRole } from '../types';

interface LedgerScreenProps {
  user: User | null;
  agent: Agent;
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onBack: () => void;
}

const LedgerScreen: React.FC<LedgerScreenProps> = ({ user, agent, transactions, onDelete, onEdit, onBack }) => {
  const [txToDelete, setTxToDelete] = useState<string | null>(null);
  const isMaster = user?.role === UserRole.MASTER;

  const confirmDelete = () => {
    if (isMaster) return;
    if (txToDelete) {
      onDelete(txToDelete);
      setTxToDelete(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB] animate-in slide-in-from-right duration-400 relative font-sans">
      <header className="p-8 bg-[#E2136E] text-white relative rounded-b-[40px] shadow-xl shrink-0 overflow-hidden">
        <button onClick={onBack} className="absolute left-8 top-9 w-11 h-11 flex items-center justify-center bg-white/10 rounded-xl text-white text-xl active:scale-95 transition-all border border-white/20 z-20">←</button>
        
        <div className="text-center mt-12 relative z-10 pb-8">
          <h1 className="text-2xl font-black tracking-tighter">{agent.name}</h1>
          <p className="text-[10px] opacity-60 font-black tracking-[0.3em] uppercase mt-2">{agent.mobile}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto mt-6 px-4 custom-scrollbar pb-10">
        <div className="sticky top-0 bg-[#F9FAFB] px-6 py-4 z-10 flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] border-b border-slate-200/50">
           <span>Activity Archive</span>
           <span>Impact</span>
        </div>

        <div className="divide-y divide-slate-100 mb-20">
          {transactions.map(tx => {
            const isCredit = [TransactionType.CASH_RECEIVED, TransactionType.B2B_RECEIVE].includes(tx.type);
            const isDueAdj = tx.type === TransactionType.DUE_ADJUSTMENT;
            
            return (
              <div 
                key={tx.id} 
                onClick={() => !isMaster && onEdit(tx.id)}
                className="p-6 flex justify-between items-center group active:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-black text-[#111827]">{new Date(tx.timestamp).toLocaleDateString()}</p>
                    <span className="text-[9px] font-bold text-slate-300 tracking-tighter">• {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className={`text-[8px] font-black uppercase mt-1 tracking-widest ${isDueAdj ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {isDueAdj ? 'DUE ADDED' : tx.type.replace('_', ' ')}
                  </p>
                  {tx.note && <p className="text-[11px] text-slate-400 mt-2 font-medium leading-relaxed italic opacity-70">"{tx.note}"</p>}
                </div>
                <div className="flex items-center gap-6">
                   <div className="text-right">
                     <p className={`text-base font-black tracking-tighter ${isCredit ? 'text-[#059669]' : (isDueAdj ? 'text-indigo-600' : 'text-[#DC2626]')}`}>
                        {isCredit ? '+' : (isDueAdj ? '' : '-')} ৳{tx.amount.toLocaleString()}
                     </p>
                   </div>
                   {!isMaster && (
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         setTxToDelete(tx.id);
                       }} 
                       className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-300 hover:text-rose-500 transition-all border border-slate-100"
                     >
                       <span className="text-lg">🗑️</span>
                     </button>
                   )}
                </div>
              </div>
            );
          })}
          {transactions.length === 0 && (
            <div className="py-24 text-center opacity-20">
               <div className="text-4xl mb-4 text-slate-300">🏜️</div>
               <p className="text-[10px] font-black uppercase tracking-[0.5em]">No Log Entries</p>
            </div>
          )}
        </div>
      </div>

      {txToDelete && !isMaster && (
        <div className="fixed inset-0 bg-[#111827]/40 backdrop-blur-md z-[2000] flex items-center justify-center px-8">
          <div className="w-full bg-white rounded-[40px] p-10 shadow-2xl border border-slate-100 text-center relative overflow-hidden">
            <h2 className="text-2xl font-black text-[#111827] mb-3 tracking-tighter">Remove Entry?</h2>
            <p className="text-slate-500 text-[10px] font-bold mb-10 uppercase tracking-widest leading-relaxed">This will revert the account balance for this specific entry permanently.</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full bg-[#DC2626] text-white font-black py-5 rounded-[24px] shadow-lg text-[11px] uppercase tracking-widest active:scale-95 transition-all">Destroy & Revert</button>
              <button onClick={() => setTxToDelete(null)} className="w-full py-3 text-slate-400 font-black text-[9px] uppercase tracking-[0.3em]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LedgerScreen;
