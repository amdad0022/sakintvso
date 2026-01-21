
import { Agent, TransactionType, Transaction, UserRole } from '../types';
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface TransactionEntryScreenProps {
  userRole: UserRole;
  agents: Agent[];
  preselectedAgentId: string | null;
  preselectedType: TransactionType | null;
  editingTx?: Transaction;
  onSubmit: (tx: { agentId: string, type: TransactionType, amount: number, note: string }) => void;
  onBack: () => void;
}

const TransactionEntryScreen: React.FC<TransactionEntryScreenProps> = ({ 
  userRole, agents, preselectedAgentId, preselectedType, editingTx, onSubmit, onBack 
}) => {
  const isMaster = userRole === UserRole.MASTER;
  
  const [agentId, setAgentId] = useState(editingTx?.agentId || preselectedAgentId || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [type, setType] = useState<TransactionType | null>(editingTx?.type || preselectedType);
  const [amount, setAmount] = useState(editingTx ? editingTx.amount.toString() : '');
  const [note, setNote] = useState(editingTx?.note || '');
  const [isMounted, setIsMounted] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [inputWidth, setInputWidth] = useState(60);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Update input width whenever amount changes to keep it centered
  useEffect(() => {
    if (measureRef.current) {
      // Add a bit of padding for the cursor
      setInputWidth(Math.max(40, measureRef.current.offsetWidth + 10));
    }
  }, [amount]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isMaster) return;
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    if (rawValue.length > 0) {
      setAmount(rawValue.replace(/^0+/, ''));
    } else {
      setAmount('');
    }
  };

  const formattedAmountDisplay = (val: string) => {
    if (!val) return '';
    const num = parseInt(val, 10);
    if (isNaN(num)) return '';
    return num.toLocaleString();
  };

  const handleStandardSubmit = (e?: React.MouseEvent | React.FormEvent) => {
    if (isMaster) return;
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const cleanAmount = amount.replace(/[^0-9]/g, '');
    const numericAmount = parseInt(cleanAmount, 10) || 0;

    if (!agentId || !type || numericAmount <= 0) return;
    
    onSubmit({ agentId, type, amount: numericAmount, note });
  };

  const handleGoBack = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onBack();
  }, [onBack]);

  const getTransactionLabel = () => {
    if (!type) return 'Transaction';
    switch (type) {
      case TransactionType.CASH_GIVEN: return 'Cash Given';
      case TransactionType.CASH_RECEIVED: return 'Cash Received';
      case TransactionType.B2B_SEND: return 'B2B Send';
      case TransactionType.B2B_RECEIVE: return 'B2B Received';
      case TransactionType.DUE_ADJUSTMENT: return 'DUE';
      default: return 'Transaction';
    }
  };

  const selectedAgent = agents.find(a => a.id === agentId);
  const cleanAmountVal = amount.replace(/[^0-9]/g, '');
  const canSubmit = agentId && type && cleanAmountVal.length > 0 && parseInt(cleanAmountVal, 10) > 0;

  if (!agentId) {
    return (
      <div className={`flex flex-col h-full bg-[#F9FAFB] transition-all duration-300 ${isMounted ? 'opacity-100' : 'opacity-0'} overflow-hidden`}>
        <header className="px-6 pt-10 pb-8 bg-[#E2136E] text-white z-20 shadow-xl rounded-b-[40px] relative overflow-hidden text-center shrink-0">
          <button 
            type="button" 
            onClick={() => onBack()} 
            className="absolute left-6 top-10 w-11 h-11 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-2xl text-white text-xl active:scale-90 border border-white/30 z-50 cursor-pointer"
          >
            ←
          </button>
          <h1 className="text-xl font-black tracking-tight uppercase mt-1">Select Agent</h1>
          <div className="relative z-10 mt-6 px-2">
            <input 
              type="text" 
              placeholder="Search point or number..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-white border-none rounded-[24px] px-12 py-5 outline-none font-bold text-slate-900 text-lg shadow-2xl placeholder:text-slate-300"
            />
            <span className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20 text-xl">🔍</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {agents.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.mobile.includes(searchTerm)).map(a => (
            <button key={a.id} onClick={() => setAgentId(a.id)} className="w-full bg-white p-6 rounded-[32px] text-left flex justify-between items-center active:scale-[0.98] transition-all border border-slate-100 shadow-sm hover:border-[#E2136E]/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 text-[#E2136E] rounded-2xl flex items-center justify-center text-lg font-black border border-rose-100">{a.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                   <p className="font-black text-[#111827] text-base leading-tight truncate uppercase">{a.name}</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{a.mobile}</p>
                </div>
              </div>
              <span className="text-slate-200 text-2xl">→</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-[#F8FAFC] transition-all duration-300 ${isMounted ? 'opacity-100' : 'opacity-0'} overflow-hidden relative font-sans`}>
      <header className="px-6 py-12 flex flex-col items-center shrink-0 bg-rose-50 shadow-[0_2px_15px_rgba(226,19,110,0.05)] border-b border-rose-100">
        <button 
          type="button"
          onClick={handleGoBack} 
          className="absolute left-6 top-10 w-10 h-10 flex items-center justify-center text-[#E2136E] text-2xl active:scale-95 transition-all cursor-pointer"
        >
          ←
        </button>
        <div className="text-center mt-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{selectedAgent?.name}</h2>
          <p className="text-sm text-[#E2136E] font-black mt-1 tracking-widest">{selectedAgent?.mobile}</p>
        </div>
        <div className="mt-12 bg-white px-8 py-4 rounded-full shadow-sm border border-rose-100">
          <h1 className="text-xl font-black uppercase tracking-[0.2em] text-[#E2136E] leading-none">{getTransactionLabel()}</h1>
        </div>
      </header>

      <div className="flex-1 p-6 flex flex-col">
        {/* Flatter amount box with fully centered amount and moving symbol */}
        <div className="bg-white rounded-[40px] py-8 px-6 shadow-[0_15px_40px_-15px_rgba(226,19,110,0.08)] border-2 border-[#E2136E] space-y-6">
          
          {/* Amount Input Row - Using Flex to keep symbol and number together and centered */}
          <div className="flex items-center justify-center relative overflow-hidden h-20">
            {/* Hidden span for width measurement */}
            <span 
              ref={measureRef} 
              className="absolute invisible whitespace-pre text-5xl font-black"
            >
              {formattedAmountDisplay(amount) || '0'}
            </span>
            
            <div className="flex items-center">
              <span className="text-5xl font-black text-[#E2136E] mr-2 mb-1">৳</span>
              <input 
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={formattedAmountDisplay(amount)}
                onChange={handleAmountChange}
                placeholder="0"
                autoFocus
                className="bg-transparent border-none outline-none text-5xl font-black p-0 placeholder:text-slate-100 focus:ring-0 focus:border-transparent text-slate-900 leading-none"
                style={{ width: `${inputWidth}px` }}
              />
            </div>
          </div>

          <div className="px-2 text-center pt-2">
            <input 
              type="text" 
              placeholder="Add a special note..." 
              value={note} 
              onChange={(e) => setNote(e.target.value)} 
              className="w-full bg-transparent outline-none font-black text-black text-lg text-center placeholder:text-slate-200 focus:ring-0 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex-1"></div>
        
        <div className="px-4 mb-36">
          <button 
            type="button"
            onClick={handleStandardSubmit} 
            disabled={!canSubmit || isMaster} 
            className={`w-full py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] transition-all duration-300 flex items-center justify-center ${
                canSubmit 
                ? 'bg-[#E2136E] text-white shadow-[0_20px_40px_rgba(226,19,110,0.25)] active:scale-[0.98]' 
                : 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-80'
            }`}
          >
            Complete Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionEntryScreen;
