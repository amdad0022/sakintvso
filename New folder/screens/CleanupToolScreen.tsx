
import React, { useMemo, useState } from 'react';
import { Agent } from '../types';

interface CleanupToolScreenProps {
  agents: Agent[];
  onConfirmDelete: (agentIds: string[]) => void;
  onDeleteAll: () => void;
  onBack: () => void;
}

const CleanupToolScreen: React.FC<CleanupToolScreenProps> = ({ agents, onConfirmDelete, onDeleteAll, onBack }) => {
  const [showWipeModal, setShowWipeModal] = useState(false);

  const demoAgents = useMemo(() => {
    return agents.filter(agent => {
      const name = agent.name.toLowerCase();
      const hasKeywords = ['demo', 'test', 'sample'].some(keyword => name.includes(keyword));
      const noDso = !agent.assignedDsoMobile || agent.assignedDsoMobile.trim() === '';
      return hasKeywords || noDso;
    });
  }, [agents]);

  const handleCleanup = () => {
    if (demoAgents.length === 0) return;
    const confirmText = `Are you sure you want to PERMANENTLY delete ${demoAgents.length} demo agents? This action cannot be undone.`;
    if (window.confirm(confirmText)) {
      onConfirmDelete(demoAgents.map(a => a.id));
    }
  };

  const handleMasterWipe = () => {
    onDeleteAll();
    setShowWipeModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#FBFCFE] overflow-hidden animate-in fade-in duration-500">
      <header className="p-8 bg-white border-b border-slate-100 flex items-center gap-6 shrink-0 z-20">
        <button onClick={onBack} className="w-11 h-11 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 active:scale-90 transition-all">
          ←
        </button>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">System Cleanup</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-12 pb-32 custom-scrollbar">
        {/* WARNING PANEL */}
        <div className="bg-rose-50 rounded-[40px] p-8 border border-rose-100 flex gap-6 items-start shadow-sm">
          <div className="text-4xl">⚠️</div>
          <div>
            <h3 className="text-rose-900 font-black text-[10px] uppercase tracking-[0.2em] mb-3">Database Integrity Warning</h3>
            <p className="text-rose-700/70 text-[11px] leading-relaxed font-bold uppercase tracking-tight">
              These tools perform direct modifications on the <span className="text-rose-900">global registry</span>. 
              Once data is purged, it cannot be restored.
            </p>
          </div>
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-7 rounded-[36px] border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-2">Demo Points</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{demoAgents.length}</p>
          </div>
          <div className="bg-white p-7 rounded-[36px] border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-2">Total Registry</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{agents.length}</p>
          </div>
        </div>

        {/* DEMO CLEANUP SECTION */}
        <section className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Demo Identification</h3>
              {demoAgents.length > 0 && (
                <button 
                  onClick={handleCleanup}
                  className="text-rose-500 text-[9px] font-black uppercase tracking-widest underline underline-offset-4 active:opacity-50"
                >
                   Quick Purge
                </button>
              )}
           </div>
          
          {demoAgents.length > 0 ? (
            <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm divide-y divide-slate-50">
              {demoAgents.map(agent => (
                <div key={agent.id} className="p-6 flex justify-between items-center group">
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-black text-slate-800 leading-tight truncate">{agent.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {agent.mobile} • {!agent.assignedDsoMobile ? 'DISCONNECTED' : 'DEMO TAG'}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-rose-300 group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors">🗑️</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center bg-white rounded-[44px] border border-slate-100 shadow-sm border-dashed">
              <span className="text-5xl block mb-4">✨</span>
              <p className="text-slate-900 font-black text-xs uppercase tracking-widest">Registry Clean</p>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-tight mt-2 opacity-60">No sample data detected in current database state.</p>
            </div>
          )}
        </section>

        {/* MASTER WIPE SECTION - THE REQUESTED FEATURE */}
        <section className="space-y-6 pt-10 border-t border-slate-100">
           <div className="flex flex-col items-center text-center px-6">
              <div className="w-16 h-16 bg-slate-900 rounded-[24px] flex items-center justify-center text-2xl mb-6 shadow-xl border border-white/10">🧹</div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">Master Database Wipe</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 leading-relaxed">
                 Permanently delete all {agents.length} registered agents. This action will reset the registry to a zero-base state.
              </p>
           </div>
           
           <button 
             onClick={() => setShowWipeModal(true)}
             disabled={agents.length === 0}
             className="w-full bg-slate-900 text-white font-black py-6 rounded-[32px] shadow-2xl active:scale-95 transition-all text-[11px] uppercase tracking-[0.3em] disabled:opacity-20 flex items-center justify-center gap-4 group"
           >
              <span>Delete All Registered Agents</span>
              <span className="text-lg group-hover:rotate-12 transition-transform">🛑</span>
           </button>
        </section>
      </div>

      {/* MASTER WIPE CONFIRMATION MODAL */}
      {showWipeModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl z-[2000] flex items-center justify-center px-8 animate-in fade-in duration-300">
          <div className="w-full bg-white rounded-[48px] p-12 shadow-2xl animate-in zoom-in-95 border border-slate-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-rose-600"></div>
            <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner border border-rose-100">🚫</div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter leading-tight">Authorize Master Wipe?</h2>
            <p className="text-slate-400 text-[10px] font-bold mb-12 uppercase tracking-[0.2em] leading-relaxed">
              This will destroy all <span className="text-rose-600 font-black">{agents.length} agent records</span> currently in the system. Transactions linked to these agents will become orphans. This action is <span className="text-slate-900 underline">final and irreversible</span>.
            </p>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleMasterWipe}
                className="w-full bg-rose-600 text-white font-black py-6 rounded-[28px] shadow-2xl shadow-rose-200 text-[11px] uppercase tracking-[0.3em] active:scale-95 transition-all"
              >
                Proceed & Wipe Database
              </button>
              <button 
                onClick={() => setShowWipeModal(false)}
                className="w-full py-2 text-slate-400 font-black text-[9px] uppercase tracking-[0.4em] active:opacity-60 transition-opacity"
              >
                Cancel & Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CleanupToolScreen;
