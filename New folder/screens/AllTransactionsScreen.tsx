
import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, TransactionType, Agent, UserRole, User } from '../types';

interface AllTransactionsScreenProps {
  user: User | null;
  initialFilter: TransactionType | 'ALL';
  transactions: Transaction[];
  agents: Agent[];
  onBack: () => void;
  onNewEntry: (forcedType?: TransactionType) => void;
  onSelectAgentLedger: (agentId: string) => void;
  onNavigateToAgents: () => void;
}

const AllTransactionsScreen: React.FC<AllTransactionsScreenProps> = ({ 
  user, initialFilter, transactions, agents, onBack, onSelectAgentLedger
}) => {
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>(initialFilter);
  const isMaster = user?.role === UserRole.MASTER;

  useEffect(() => {
    setFilterType(initialFilter);
  }, [initialFilter]);

  const filteredTransactions = useMemo(() => {
    let list = [...transactions];
    if (filterType !== 'ALL') {
      list = list.filter(t => t.type === filterType);
    }
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [transactions, filterType]);

  const getTypeStyle = (type: TransactionType) => {
    switch (type) {
      case TransactionType.CASH_RECEIVED:
      case TransactionType.B2B_RECEIVE:
        return { color: 'text-[#059669]', icon: '📥', bg: 'bg-emerald-50' };
      case TransactionType.CASH_GIVEN:
      case TransactionType.B2B_SEND:
        return { color: 'text-[#DC2626]', icon: '📤', bg: 'bg-rose-50' };
      case TransactionType.DUE_ADJUSTMENT:
        return { color: 'text-indigo-600', icon: '📝', bg: 'bg-indigo-50' };
      default:
        return { color: 'text-slate-500', icon: '📝', bg: 'bg-slate-50' };
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB] overflow-hidden animate-in fade-in duration-500 font-sans">
      {/* PINK HEADER */}
      <header className="px-6 pt-10 pb-8 bg-[#E2136E] border-b border-rose-600 flex items-center gap-6 shrink-0 shadow-xl z-20">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-[#E2136E] active:scale-95 transition-all shadow-lg font-black text-xl">◀️</button>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight leading-none uppercase">
            {isMaster ? 'Audit Hub' : (filterType === 'ALL' ? 'Activity Log' : filterType.replace('_', ' '))}
          </h1>
          <p className="text-[10px] text-white/70 font-bold uppercase tracking-[0.2em] mt-1">Official Settlement Archive</p>
        </div>
      </header>

      <div className="px-6 py-5 bg-white shrink-0 border-b border-slate-100">
        <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar">
          <FilterPill active={filterType === 'ALL'} label="All Activity" onClick={() => setFilterType('ALL')} />
          <FilterPill active={filterType === TransactionType.CASH_GIVEN} label="Given" onClick={() => setFilterType(TransactionType.CASH_GIVEN)} />
          <FilterPill active={filterType === TransactionType.CASH_RECEIVED} label="Received" onClick={() => setFilterType(TransactionType.CASH_RECEIVED)} />
          <FilterPill active={filterType === TransactionType.B2B_SEND} label="Sent" onClick={() => setFilterType(TransactionType.B2B_SEND)} />
          <FilterPill active={filterType === TransactionType.B2B_RECEIVE} label="Recv" onClick={() => setFilterType(TransactionType.B2B_RECEIVE)} />
          <FilterPill active={filterType === TransactionType.DUE_ADJUSTMENT} label="Balance" onClick={() => setFilterType(TransactionType.DUE_ADJUSTMENT)} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-32 custom-scrollbar">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map(tx => {
            const style = getTypeStyle(tx.type);
            const agent = agents.find(a => a.id === tx.agentId);
            const isOut = [TransactionType.CASH_GIVEN, TransactionType.B2B_SEND].includes(tx.type);
            
            return (
              <div key={tx.id} onClick={() => onSelectAgentLedger(tx.agentId)} className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm flex justify-between items-center active:scale-[0.99] transition-all cursor-pointer group">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 ${style.bg} rounded-2xl flex items-center justify-center text-xl border border-black/5`}>{style.icon}</div>
                  <div>
                    <h3 className="font-black text-slate-800 leading-tight text-sm uppercase">{agent?.name || 'Distribution Point'}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest opacity-80">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(tx.timestamp).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-base font-black tracking-tighter ${style.color}`}>
                    {tx.type === TransactionType.DUE_ADJUSTMENT ? '' : (isOut ? '-' : '+')}৳{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.2em] mt-0.5">{tx.type.split('_')[1] || 'TX'}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10 text-center py-20">
            <span className="text-6xl mb-6">🏜️</span>
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Empty Ledger</p>
          </div>
        )}
      </div>
    </div>
  );
};

const FilterPill = ({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) => (
  <button onClick={onClick} className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border ${active ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-white hover:border-[#E2136E]/20'}`}>
    {label}
  </button>
);

export default AllTransactionsScreen;
