
import React, { useState } from 'react';
import { HistorySnapshot, User, UserRole, Transaction, Agent, TransactionType } from '../types.ts';
import { jsPDF } from 'jspdf';

interface HistoryScreenProps {
  user: User | null;
  snapshots: HistorySnapshot[];
  activeTransactions: Transaction[];
  agents: Agent[];
  onDeleteSnapshot: (id: string) => void;
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (id: string) => void;
  onBack: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ 
  user, snapshots, activeTransactions, agents, onDeleteSnapshot, onDeleteTransaction, onEditTransaction, onBack 
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'archives'>('daily');
  const [selectedSnapshot, setSelectedSnapshot] = useState<HistorySnapshot | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    type: 'snapshot' | 'transaction';
    id: string;
    title: string;
    desc: string;
  }>({ show: false, type: 'snapshot', id: '', title: '', desc: '' });

  const isMaster = user?.role === UserRole.MASTER;

  const handleDownloadPDF = async (snapshot: HistorySnapshot) => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pink = '#E2136E';
      const gray = '#64748B';
      const black = '#111827';
      const lightGray = '#F3F4F6';

      const now = new Date().toLocaleString('en-GB');
      
      // Filter transactions to show only CASH types, excluding B2B as requested
      const cashTransactions = snapshot.transactions.filter(tx => 
        tx.type === TransactionType.CASH_GIVEN || 
        tx.type === TransactionType.CASH_RECEIVED ||
        tx.type === TransactionType.DUE_ADJUSTMENT
      );

      // Re-calculate totals specifically for the PDF based on filtered list
      const totalCashIn = cashTransactions
        .filter(t => t.type === TransactionType.CASH_RECEIVED)
        .reduce((s, t) => s + t.amount, 0);
      const totalCashOut = cashTransactions
        .filter(t => t.type === TransactionType.CASH_GIVEN)
        .reduce((s, t) => s + t.amount, 0);

      // --- PDF HEADER ---
      doc.setFillColor(pink);
      doc.rect(0, 0, 210, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('SAKIN TVS - SETTLEMENT', 15, 20);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Report Date: ${new Date(snapshot.date).toLocaleDateString('en-GB')}`, 15, 28);
      doc.text(`Official: ${snapshot.dsoName} (${user?.mobile || 'N/A'})`, 195, 28, { align: 'right' });

      // --- SUMMARY BOX (SIMPLIFIED: CASH ONLY + TOTAL ACCOUNT) ---
      doc.setFillColor(lightGray);
      doc.roundedRect(15, 45, 180, 40, 2, 2, 'F');
      
      doc.setTextColor(black);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('ACCOUNT SUMMARY (CASH ONLY)', 20, 52);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Total Cash Received: BDT ${totalCashIn.toLocaleString()}`, 20, 60);
      doc.text(`Total Cash Out: BDT ${totalCashOut.toLocaleString()}`, 20, 67);
      
      doc.setFontSize(14);
      doc.setTextColor(pink);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Market Due: BDT ${snapshot.totalDue.toLocaleString()}`, 20, 78);

      // --- TRANSACTION TABLE HEADER ---
      let y = 100;
      doc.setFontSize(10);
      doc.setTextColor(gray);
      doc.setFont('helvetica', 'bold');
      doc.text('SL', 15, y);
      doc.text('AGENT NAME & MOBILE', 25, y);
      doc.text('TRANSACTION', 120, y);
      doc.text('AMOUNT (BDT)', 195, y, { align: 'right' });
      y += 4;
      doc.setDrawColor(200);
      doc.line(15, y, 195, y);
      y += 8;

      // --- TRANSACTIONS LIST ---
      cashTransactions.forEach((tx, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        const agent = agents.find(a => a.id === tx.agentId);
        const isOut = tx.type === TransactionType.CASH_GIVEN;
        const isAdj = tx.type === TransactionType.DUE_ADJUSTMENT;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(black);
        
        // SL
        doc.text(`${index + 1}.`, 15, y);
        
        // Agent & Mobile
        doc.setFont('helvetica', 'bold');
        doc.text(agent?.name || 'Unknown Agent', 25, y);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(gray);
        doc.text(agent?.mobile || 'N/A', 25, y + 4);
        
        // Type
        doc.setFontSize(8);
        doc.setTextColor(black);
        const typeLabel = isAdj ? 'Manual Adjustment' : (isOut ? 'Cash Out' : 'Cash Received');
        doc.text(typeLabel, 120, y);
        
        // Amount
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        if (isAdj) {
          doc.setTextColor(black);
          doc.text(`${tx.amount.toLocaleString()}`, 195, y, { align: 'right' });
        } else {
          doc.setTextColor(isOut ? '#EF4444' : '#10B981');
          const sign = isOut ? '-' : '+';
          doc.text(`${sign}${tx.amount.toLocaleString()}`, 195, y, { align: 'right' });
        }

        y += 14;
        // Line separator
        doc.setDrawColor(240);
        doc.line(15, y - 4, 195, y - 4);
      });

      // --- FOOTER ---
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(gray);
        doc.text(`Generated by Sakin TVS Elite | ${now} | Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      }

      doc.save(`SakinTvs_CashReport_${snapshot.dsoName}_${new Date(snapshot.date).toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error(err);
      alert('PDF তৈরি করা সম্ভব হয়নি।');
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerDeleteSnapshot = (e: React.MouseEvent, s: HistorySnapshot) => {
    if (isMaster) return;
    e.stopPropagation();
    setConfirmModal({
      show: true,
      type: 'snapshot',
      id: s.id,
      title: 'Delete Archive?',
      desc: `This will permanently remove the settlement record from ${new Date(s.date).toLocaleDateString()}. This action is irreversible.`
    });
  };

  const triggerDeleteDailyTx = (e: React.MouseEvent, tx: Transaction) => {
    if (isMaster) return;
    e.stopPropagation();
    setConfirmModal({
      show: true,
      type: 'transaction',
      id: tx.id,
      title: 'Delete Log?',
      desc: "This will remove this individual entry from today's history and restore the agent's previous balance."
    });
  };

  const handleConfirmDelete = () => {
    if (isMaster) return;
    if (confirmModal.type === 'snapshot') {
      onDeleteSnapshot(confirmModal.id);
      if (selectedSnapshot?.id === confirmModal.id) setSelectedSnapshot(null);
    } else {
      onDeleteTransaction(confirmModal.id);
    }
    setConfirmModal({ ...confirmModal, show: false });
  };

  const getTxTypeLabel = (type: TransactionType) => {
    switch (type) {
      case TransactionType.CASH_GIVEN: return 'Cash Given';
      case TransactionType.CASH_RECEIVED: return 'Cash Received';
      case TransactionType.B2B_SEND: return 'B2B Sent';
      case TransactionType.B2B_RECEIVE: return 'B2B Received';
      case TransactionType.DUE_ADJUSTMENT: return 'Balance Adjusted';
      default: return 'Transaction';
    }
  };

  const getTxIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.CASH_RECEIVED:
      case TransactionType.B2B_RECEIVE: return '📥';
      case TransactionType.CASH_GIVEN:
      case TransactionType.B2B_SEND: return '📤';
      default: return '📝';
    }
  };

  if (selectedSnapshot) {
    return (
      <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden font-sans animate-in slide-in-from-right duration-400">
        <header className="px-6 py-10 bg-[#E2136E] border-b border-rose-600 flex items-center justify-between shrink-0 z-30 shadow-xl">
          <div className="flex items-center gap-6">
            <button onClick={() => setSelectedSnapshot(null)} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-[#E2136E] active:scale-90 transition-all font-black text-xl">◀️</button>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight leading-none">Record Archive</h1>
              <p className="text-[9px] text-white/60 font-bold uppercase tracking-[0.3em] mt-2">
                {new Date(selectedSnapshot.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button 
              disabled={isGenerating}
              onClick={() => handleDownloadPDF(selectedSnapshot)}
              className="px-5 h-11 flex items-center justify-center bg-white text-[#E2136E] rounded-2xl shadow-lg active:scale-90 transition-all disabled:opacity-50 text-[10px] font-black uppercase tracking-widest gap-2"
            >
              {isGenerating ? '⌛' : '📄 PDF'}
            </button>
            {!isMaster && (
              <button 
                onClick={(e) => triggerDeleteSnapshot(e, selectedSnapshot)} 
                className="w-11 h-11 flex items-center justify-center bg-white/10 rounded-2xl text-white shadow-sm border border-white/20 active:scale-90 transition-all"
              >
                🗑️
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-7 space-y-8 pb-12 custom-scrollbar">
          <div className="ruby-gradient p-10 rounded-[44px] text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[80px]"></div>
            <p className="text-rose-100/60 text-[10px] font-black uppercase mb-3 tracking-[0.4em]">Settled Liability</p>
            <p className="text-white text-5xl font-black tracking-tighter">৳{selectedSnapshot.totalDue.toLocaleString()}</p>
          </div>

          <div className="bg-white border border-slate-100 rounded-[32px] p-6 flex items-center justify-between">
             <div className="text-center flex-1">
                <p className="text-emerald-500 text-lg font-black tracking-tighter">৳{selectedSnapshot.stats.cashReceived.toLocaleString()}</p>
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">Total In</p>
             </div>
             <div className="w-px h-10 bg-slate-100"></div>
             <div className="text-center flex-1">
                <p className="text-rose-500 text-lg font-black tracking-tighter">৳{selectedSnapshot.stats.cashGiven.toLocaleString()}</p>
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">Total Out</p>
             </div>
          </div>

          <section className="space-y-4">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] ml-2">Snapshot Ledger</p>
            <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm divide-y divide-slate-50">
              {selectedSnapshot.transactions.map(tx => {
                const agent = agents.find(a => a.id === tx.agentId);
                const isOut = [TransactionType.CASH_GIVEN, TransactionType.B2B_SEND].includes(tx.type);
                return (
                  <div key={tx.id} className="p-5 flex justify-between items-center group">
                    <div>
                      <span className="text-xs font-black text-slate-800 block leading-tight">{agent?.name || 'Authorized Point'}</span>
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1">{getTxTypeLabel(tx.type)}</span>
                    </div>
                    <span className={`text-sm font-black tracking-tighter ${isOut ? 'text-rose-600' : 'text-emerald-500'}`}>
                      {isOut ? '-' : '+'} ৳{tx.amount.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden font-sans animate-in fade-in duration-500 relative">
      <header className="px-6 pt-10 pb-6 bg-[#E2136E] shrink-0 z-30 shadow-xl border-b border-rose-600">
        <div className="flex items-center gap-6 mb-8">
          <button onClick={onBack} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-[#E2136E] active:scale-90 transition-all font-black text-xl shadow-lg">◀️</button>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight leading-none">History Hub</h1>
            <p className="text-[9px] text-white/60 font-bold uppercase tracking-[0.3em] mt-2">{isMaster ? 'AUDIT MODE' : 'NAGAD ELITE RECORDS'}</p>
          </div>
        </div>

        <div className="bg-white/10 p-1.5 rounded-[24px] flex gap-1">
          <button onClick={() => setActiveTab('daily')} className={`flex-1 py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'daily' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/60 hover:text-white'}`}>Today's Ledger</button>
          <button onClick={() => setActiveTab('archives')} className={`flex-1 py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'archives' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/60 hover:text-white'}`}>Archive Records</button>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 pb-24 custom-scrollbar">
        {activeTab === 'daily' ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center px-4 mb-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Individual logs</p>
                 <span className="text-[8px] font-black bg-slate-900 text-white px-2.5 py-1 rounded-full uppercase tracking-tighter">{activeTransactions.length} Total</span>
             </div>
             
             {activeTransactions.length > 0 ? (
                activeTransactions.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(tx => {
                  const agent = agents.find(a => a.id === tx.agentId);
                  const isOut = [TransactionType.CASH_GIVEN, TransactionType.B2B_SEND].includes(tx.type);
                  
                  return (
                    <div key={tx.id} className="bg-white p-5 rounded-[32px] border border-slate-100 flex justify-between items-center shadow-sm transition-all">
                       <div className="flex items-center gap-4 flex-1">
                          <div className={`w-10 h-10 flex items-center justify-center rounded-2xl text-lg shadow-inner border border-black/5 shrink-0 ${isOut ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                            {getTxIcon(tx.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="text-sm font-black text-slate-900 leading-tight truncate">{agent?.name || 'Distribution Point'}</p>
                             <div className="flex items-center gap-2 mt-0.5">
                               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{getTxTypeLabel(tx.type)}</p>
                               <span className="text-slate-200 text-[8px]">|</span>
                               <p className="text-[8px] font-bold text-slate-300 uppercase">{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                             </div>
                             <p className={`text-sm font-black tracking-tighter mt-1 ${isOut ? 'text-rose-600' : 'text-emerald-500'}`}>
                                {isOut ? '-' : '+'} ৳{tx.amount.toLocaleString()}
                             </p>
                          </div>
                       </div>
                       
                       {!isMaster && (
                         <div className="flex items-center gap-2">
                            <button onClick={() => onEditTransaction(tx.id)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-500 transition-colors border border-slate-100 active:scale-90">✏️</button>
                            <button onClick={(e) => triggerDeleteDailyTx(e, tx)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-colors border border-slate-100 active:scale-90">🗑️</button>
                         </div>
                       )}
                    </div>
                  );
                })
             ) : (
                <div className="py-24 text-center opacity-20">
                   <div className="w-20 h-20 bg-white rounded-[40px] border border-slate-100 flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm">🏜️</div>
                   <p className="text-[10px] font-black uppercase tracking-widest">No individual logs for today</p>
                </div>
             )}
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {snapshots.length > 0 ? (
              snapshots.map(s => (
                <div key={s.id} onClick={() => setSelectedSnapshot(s)} className="bg-white p-7 rounded-[40px] border border-slate-100 shadow-sm flex justify-between items-center active:scale-[0.98] transition-all cursor-pointer group overflow-hidden">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-[20px] flex items-center justify-center text-2xl group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors">📁</div>
                    <div>
                      <p className="text-slate-900 font-black text-base leading-tight">Settlement Backup</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest">{new Date(s.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <p className="text-slate-900 font-black text-lg tracking-tighter">৳{s.totalDue.toLocaleString()}</p>
                      <p className="text-[8px] text-slate-300 font-black uppercase tracking-widest">Archived Due</p>
                    </div>
                    {!isMaster && (
                      <button onClick={(e) => triggerDeleteSnapshot(e, s)} className="w-11 h-11 flex items-center justify-center bg-rose-50 text-rose-400 rounded-2xl active:scale-90 transition-all border border-rose-100">🗑️</button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20 py-24 text-center px-8">
                <div className="w-24 h-24 bg-white rounded-[40px] border border-slate-100 flex items-center justify-center text-5xl mb-8 shadow-sm">📂</div>
                <p className="text-sm font-black text-slate-800 uppercase tracking-widest">No Archived Records</p>
              </div>
            )}
          </div>
        )}
      </div>

      {confirmModal.show && !isMaster && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[2000] flex items-center justify-center px-8 animate-in fade-in duration-300">
          <div className="w-full bg-white rounded-[44px] p-10 shadow-2xl animate-in zoom-in-95 border border-slate-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500"></div>
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-8 shadow-inner">⚠️</div>
            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter">{confirmModal.title}</h2>
            <p className="text-slate-400 text-[10px] font-bold mb-10 uppercase tracking-[0.15em] leading-relaxed px-2">{confirmModal.desc}</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleConfirmDelete} className="w-full bg-rose-600 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-rose-200 text-[11px] uppercase tracking-widest active:scale-[0.97] transition-all">Confirm Deletion</button>
              <button onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="w-full py-4 text-slate-400 font-black text-[9px] uppercase tracking-[0.3em] active:opacity-60 transition-opacity">Cancel & Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryScreen;
