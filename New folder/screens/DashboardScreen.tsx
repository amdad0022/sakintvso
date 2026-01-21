
import React, { useMemo, useState, useEffect } from 'react';
import { User, Transaction, TransactionType, Agent } from '../types';

interface DashboardScreenProps {
  user: User | null;
  operatingAsDSO: User | null;
  transactions: Transaction[];
  agents: Agent[];
  onNavigate: (screen: string, filter?: TransactionType | 'ALL') => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ 
  user, operatingAsDSO, transactions, agents, onNavigate
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    return {
      cashGiven: transactions.filter(t => t.type === TransactionType.CASH_GIVEN).reduce((s, t) => s + t.amount, 0),
      cashReceived: transactions.filter(t => t.type === TransactionType.CASH_RECEIVED).reduce((s, t) => s + t.amount, 0),
      b2bSend: transactions.filter(t => t.type === TransactionType.B2B_SEND).reduce((s, t) => s + t.amount, 0),
      b2bReceive: transactions.filter(t => t.type === TransactionType.B2B_RECEIVE).reduce((s, t) => s + t.amount, 0),
      totalDue: agents.reduce((s, a) => s + a.currentDue, 0),
    };
  }, [transactions, agents]);

  const displayUser = operatingAsDSO || user;
  const displayUserName = displayUser?.name || 'Officer';

  const formattedDate = currentTime.toLocaleDateString('en-GB', { 
    day: 'numeric', month: 'short', year: 'numeric'
  });
  const formattedTime = currentTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', minute: '2-digit', hour12: true 
  });

  return (
    <div className="flex flex-col h-full bg-[#FAFBFF] overflow-hidden animate-in fade-in duration-500 relative">
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-32">
        
        {/* ENHANCED PREMIUM HEADER WITH CUSTOM VERIFIED BADGE */}
        <header className="bg-[#E2136E] pt-16 pb-16 px-7 rounded-b-[60px] shadow-2xl shadow-rose-200 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
          
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-[24px] flex items-center justify-center border-2 border-white/30 shadow-2xl overflow-hidden ring-4 ring-white/10">
                 {displayUser?.profilePic ? (
                   <img src={displayUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-white text-3xl font-black">{displayUserName.charAt(0)}</span>
                 )}
              </div>
              <div className="flex flex-col">
                 <div className="flex items-center gap-1">
                    <h1 className="text-2xl font-black text-white tracking-tighter leading-tight uppercase drop-shadow-md">
                        {displayUserName}
                    </h1>
                    {/* CUSTOM BLUE VERIFIED BADGE FROM IMAGE */}
                    <div className="shrink-0 mb-0.5 ml-0.5">
                      <svg width="22" height="22" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 4L29.25 8.25L35.5 7.5L38 13.25L43.75 15.75L43 22L47.25 27.25L43 32.5L43.75 38.75L38 41.25L35.5 47L29.25 46.25L24 50.5L18.75 46.25L12.5 47L10 41.25L4.25 38.75L5 32.5L0.75 27.25L5 22L4.25 15.75L10 13.25L12.5 7.5L18.75 8.25L24 4Z" fill="#3B82F6"/>
                        <path d="M14 26L21 33L35 19" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                 </div>
                 {/* DATE AND TIME UNDER NAME */}
                 <div className="flex items-center gap-2 mt-1.5 bg-black/5 px-3 py-0.5 rounded-full border border-white/10 self-start">
                    <p className="text-[9px] font-black text-white uppercase tracking-widest">
                       {formattedDate}
                    </p>
                    <span className="w-1 h-1 bg-white/30 rounded-full"></span>
                    <p className="text-[9px] font-black text-white uppercase tracking-widest tabular-nums">
                       {formattedTime}
                    </p>
                 </div>
              </div>
            </div>
            
            {/* SETTINGS GEAR */}
            <button 
              onClick={() => onNavigate('profile')} 
              className="w-14 h-14 bg-white text-[#E2136E] rounded-2xl flex items-center justify-center active:scale-90 transition-all shadow-2xl border-4 border-rose-50/50"
            >
              <span className="text-2xl">⚙️</span>
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="px-5 -mt-8 space-y-8 pb-10">
          
          {/* MARKET LIABILITY CARD - Changed to Total DUE */}
          <div className="px-4 relative z-20">
             <div 
              className="bg-white border-2 border-indigo-100 rounded-[40px] p-8 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all shadow-[0_30px_60px_-15px_rgba(79,70,229,0.3)] relative overflow-hidden group"
              onClick={() => onNavigate('due-details')}
            >
              <div className="absolute left-0 top-0 w-2.5 h-full bg-indigo-500"></div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] mb-2 group-hover:text-indigo-600 transition-colors">Total DUE</p>
                <h2 className="text-4xl font-black text-slate-900 leading-none tracking-tighter">
                  ৳{stats.totalDue.toLocaleString()}
                </h2>
              </div>
              <div className="bg-indigo-50 text-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center font-black shadow-inner border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                 ▶
              </div>
            </div>
          </div>

          {/* ACTION TILES WITH CUSTOM BORDERS AND SHADOWS */}
          <div className="grid grid-cols-2 gap-6 pt-2">
            <CompactTile 
              label="Cash Out" 
              value={stats.cashGiven} 
              color="text-red-600" 
              icon="📤" 
              borderColor="border-red-500"
              glowColor="shadow-[0_20px_45px_-12px_rgba(239,68,68,0.4)]"
              onClick={() => onNavigate('all-transactions', TransactionType.CASH_GIVEN)} 
            />
            <CompactTile 
              label="Cash In" 
              value={stats.cashReceived} 
              color="text-green-600" 
              icon="📥" 
              borderColor="border-green-500"
              glowColor="shadow-[0_20px_45px_-12px_rgba(34,197,94,0.4)]"
              onClick={() => onNavigate('all-transactions', TransactionType.CASH_RECEIVED)} 
            />
            <CompactTile 
              label="B2B Send" 
              value={stats.b2bSend} 
              color="text-pink-600" 
              icon="📱" 
              borderColor="border-pink-500"
              glowColor="shadow-[0_20px_45px_-12px_rgba(236,72,153,0.4)]"
              onClick={() => onNavigate('all-transactions', TransactionType.B2B_SEND)} 
            />
            <CompactTile 
              label="B2B Recv" 
              value={stats.b2bReceive} 
              color="text-blue-600" 
              icon="📲" 
              borderColor="border-blue-500"
              glowColor="shadow-[0_20px_45px_-12px_rgba(59,130,246,0.4)]"
              onClick={() => onNavigate('all-transactions', TransactionType.B2B_RECEIVE)} 
            />
          </div>
        </main>
      </div>
    </div>
  );
};

const CompactTile = ({ label, value, color, icon, borderColor, glowColor, onClick }: { label: string, value: number, color: string, icon: string, borderColor: string, glowColor: string, onClick: () => void }) => (
  <div 
    onClick={onClick} 
    className={`bg-white p-7 rounded-[44px] active:scale-[0.96] transition-all cursor-pointer border-2 ${borderColor} flex flex-col items-center text-center group ${glowColor} hover:scale-[1.02]`}
  >
    <div className={`w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl mb-4 border border-slate-100 group-hover:scale-110 transition-transform shadow-inner`}>
      {icon}
    </div>
    <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-2">{label}</p>
    <p className={`${color} text-xl font-black tracking-tighter leading-none`}>৳{value.toLocaleString()}</p>
  </div>
);

export default DashboardScreen;
