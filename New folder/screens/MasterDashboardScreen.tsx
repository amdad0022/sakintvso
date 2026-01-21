import React, { useMemo, useState } from 'react';
import { User, Transaction, Agent, TransactionType } from '../types';

interface MasterDashboardScreenProps {
  user: User;
  transactions: Transaction[];
  agents: Agent[];
  dsos: User[];
  onNavigate: (screen: string, filter?: TransactionType | 'ALL') => void;
}

const MasterDashboardScreen: React.FC<MasterDashboardScreenProps> = ({ 
  user, transactions, agents, dsos, onNavigate
}) => {
  const [dateRange, setDateRange] = useState<'today' | 'month' | 'all'>('all');

  const stats = useMemo(() => {
    const now = new Date();
    const filteredTxs = transactions.filter(tx => {
      const txDate = new Date(tx.timestamp);
      if (dateRange === 'today') {
        return txDate.toDateString() === now.toDateString();
      }
      if (dateRange === 'month') {
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    const totalDue = agents.reduce((s, a) => s + a.currentDue, 0);
    const cashGiven = filteredTxs.filter(t => t.type === TransactionType.CASH_GIVEN).reduce((s, t) => s + t.amount, 0);
    const cashReceived = filteredTxs.filter(t => t.type === TransactionType.CASH_RECEIVED).reduce((s, t) => s + t.amount, 0);
    const b2bSend = filteredTxs.filter(t => t.type === TransactionType.B2B_SEND).reduce((s, t) => s + t.amount, 0);
    const b2bReceive = filteredTxs.filter(t => t.type === TransactionType.B2B_RECEIVE).reduce((s, t) => s + t.amount, 0);
    
    const dsoPerformance = dsos.map(d => {
      const dsoTxs = filteredTxs.filter(tx => tx.dsoId === d.id);
      return {
        id: d.id,
        name: d.name,
        mobile: d.mobile,
        volume: dsoTxs.reduce((s, tx) => s + tx.amount, 0),
        count: dsoTxs.length
      };
    }).sort((a, b) => b.volume - a.volume);

    return { totalDue, cashGiven, cashReceived, b2bSend, b2bReceive, dsoPerformance };
  }, [transactions, agents, dsos, dateRange]);

  return (
    <div className="flex flex-col h-full bg-[#F1F5F9] overflow-hidden animate-in fade-in duration-700">
      <header className="px-6 pt-12 pb-8 bg-slate-900 shrink-0 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.4em]">Audit Console Hub</p>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter leading-none">{user.name}</h1>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center">
            <span className="text-xl">🏛️</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('due-details')}
          className="bg-indigo-600 border border-indigo-400/30 p-7 rounded-[32px] shadow-2xl shadow-indigo-900/50 mb-6 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-tl-full translate-x-4 translate-y-4"></div>
          <p className="text-indigo-100/60 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Aggregate Market Exposure</p>
          <p className="text-4xl font-black text-white tracking-tighter">৳{stats.totalDue.toLocaleString()}</p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl gap-1 z-10 relative">
          <FilterTab active={dateRange === 'today'} label="Today" onClick={() => setDateRange('today')} />
          <FilterTab active={dateRange === 'month'} label="This Month" onClick={() => setDateRange('month')} />
          <FilterTab active={dateRange === 'all'} label="Global" onClick={() => setDateRange('all')} />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-32">
        <section className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Network Metrics</p>
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Cash Out" value={stats.cashGiven} color="text-rose-600" />
            <MetricCard label="Cash In" value={stats.cashReceived} color="text-emerald-600" />
            <MetricCard label="B2B Send" value={stats.b2bSend} color="text-blue-600" />
            <MetricCard label="B2B Recv" value={stats.b2bReceive} color="text-indigo-600" />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Official Performance</h3>
            <span className="text-[9px] font-bold text-indigo-600 uppercase">{dsos.length} ACTIVE PERSONNEL</span>
          </div>
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
            {stats.dsoPerformance.slice(0, 5).map((p, idx) => (
              <div 
                key={p.id} 
                className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xs font-black text-slate-400 border border-slate-100">
                    0{idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 leading-tight">{p.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{p.count} ENTRIES</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-sm font-black text-indigo-600 tracking-tighter">৳{p.volume.toLocaleString()}</p>
                </div>
              </div>
            ))}
            <button 
              onClick={() => onNavigate('master-dso-list')}
              className="w-full py-5 text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] active:bg-slate-50 transition-all flex items-center justify-center gap-3"
            >
              <span>Explore Personnel Registry</span>
              <span className="text-lg">→</span>
            </button>
          </div>
        </section>

        <div className="py-12 text-center opacity-10">
           <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.8em]">Master Audit Environment</p>
        </div>
      </div>
    </div>
  );
};

const FilterTab = ({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500'}`}
  >
    {label}
  </button>
);

const MetricCard = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className={`bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm`}>
    <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-2">{label}</p>
    <p className={`text-base font-black tracking-tighter ${color}`}>৳{value.toLocaleString()}</p>
  </div>
);

export default MasterDashboardScreen;