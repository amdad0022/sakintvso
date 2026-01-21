
import React, { useState, useMemo } from 'react';
import { Agent, TransactionType, User, UserRole } from '../types';

interface AgentListScreenProps {
  user: User | null;
  agents: Agent[];
  allDsos: User[];
  onSelectAgent: (id: string) => void;
  onNewTx: (id: string, type: TransactionType) => void;
  onAddAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'status'>) => void;
  onBack: () => void;
  onBulkDelete: (agentIds: string[]) => void;
  onBulkImport: () => void;
}

const AgentListScreen: React.FC<AgentListScreenProps> = ({ 
  user, agents, allDsos, onSelectAgent, onNewTx, onAddAgent, onBack, onBulkDelete, onBulkImport 
}) => {
  const [search, setSearch] = useState('');
  const [modalAgentId, setModalAgentId] = useState<string | null>(null);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());

  // Add Agent Form State
  const [addName, setAddName] = useState('');
  const [addMobile, setAddMobile] = useState('');
  const [addArea, setAddArea] = useState('Netrokona / Purbadhala');
  const [addDsoMobile, setAddDsoMobile] = useState(user?.role === UserRole.DSO ? user.mobile : (allDsos[0]?.mobile || ''));

  const filtered = useMemo(() => agents.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.mobile.includes(search)
  ), [agents, search]);

  const isMaster = user?.role === UserRole.MASTER;
  const isAdmin = user?.role === UserRole.ADMIN;

  const handleAgentClick = (agentId: string) => {
    if (isBulkMode) {
      setSelectedAgentIds(prev => {
        const next = new Set(prev);
        if (next.has(agentId)) next.delete(agentId);
        else next.add(agentId);
        return next;
      });
      return;
    }
    setModalAgentId(agentId);
  };

  const handleAddSubmit = () => {
    if (!addName.trim() || !addMobile.trim()) {
      alert("Please provide the Agent Name and Mobile Number.");
      return;
    }
    
    onAddAgent({
      name: addName.trim(),
      mobile: addMobile.trim(),
      area: addArea.trim(),
      currentDue: 0,
      assignedDsoMobile: addDsoMobile
    });

    // Reset Form
    setAddName('');
    setAddMobile('');
    setShowAddModal(false);
  };

  const activeModalAgent = agents.find(a => a.id === modalAgentId);

  // PREMISUM COLOR THEMES: THIN BORDER & SOFT BG
  const cardThemes = [
    { border: 'border-rose-200', bg: 'bg-rose-50/40', text: 'text-rose-600', dot: 'bg-rose-400' },
    { border: 'border-indigo-200', bg: 'bg-indigo-50/40', text: 'text-indigo-600', dot: 'bg-indigo-400' },
    { border: 'border-emerald-200', bg: 'bg-emerald-50/40', text: 'text-emerald-600', dot: 'bg-emerald-400' },
    { border: 'border-amber-200', bg: 'bg-amber-50/40', text: 'text-amber-600', dot: 'bg-amber-400' },
    { border: 'border-blue-200', bg: 'bg-blue-50/40', text: 'text-blue-600', dot: 'bg-blue-400' }
  ];

  return (
    <div className="flex flex-col h-full bg-[#FDFDFD] relative overflow-hidden animate-in slide-in-from-right duration-500 font-sans">
      <header className="p-6 bg-[#E2136E] shrink-0 shadow-xl z-20 pb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-11 h-11 flex items-center justify-center bg-white rounded-xl text-[#E2136E] active:scale-90 transition-all shadow-lg font-black text-xl">
              ◀️
            </button>
            <h1 className="text-xl font-black text-white tracking-tight leading-none uppercase">Registry</h1>
          </div>
          {!isMaster && (
            <button onClick={() => setShowAddModal(true)} className="bg-white text-[#E2136E] h-11 px-5 rounded-xl shadow-2xl active:scale-95 transition-all border-2 border-rose-50 flex items-center gap-2">
              <span className="text-xl font-black">+</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Add Agent</span>
            </button>
          )}
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search point..." 
            value={search} 
            // Fixed reference from setSearchTerm to setSearch
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full bg-white border-none rounded-[24px] px-14 py-4 outline-none font-bold text-slate-900 text-lg placeholder:text-slate-300 shadow-xl"
          />
          <span className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20">🔍</span>
        </div>
      </header>

      <div className="content-area p-4 space-y-3 pb-24">
        {filtered.map((agent, idx) => {
          const theme = cardThemes[idx % cardThemes.length];
          return (
            <div 
              key={agent.id} 
              onClick={() => handleAgentClick(agent.id)} 
              className={`bg-white rounded-[24px] p-5 border ${theme.border} shadow-sm flex justify-between items-center active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden`}
            >
              {/* Subtle background glow */}
              <div className={`absolute inset-0 ${theme.bg} opacity-50 pointer-events-none`}></div>
              
              <div className="flex items-center gap-4 flex-1 relative z-10">
                <div className={`w-1.5 h-8 rounded-full ${theme.dot} opacity-60`}></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-800 leading-tight text-[14px] uppercase truncate">{agent.name}</h3>
                  <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">{agent.mobile}</p>
                </div>
              </div>
              
              <div className="text-right relative z-10 shrink-0">
                <p className={`text-base font-black tracking-tighter ${agent.currentDue > 0 ? 'text-[#E2136E]' : 'text-emerald-500'}`}>
                  ৳{Math.abs(agent.currentDue).toLocaleString()}
                </p>
                <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Balance</p>
              </div>
            </div>
          );
        })}
        
        {filtered.length === 0 && (
          <div className="py-24 text-center opacity-20">
            <div className="text-6xl mb-4">🏜️</div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Agents Found</p>
          </div>
        )}
      </div>

      {/* QUICK ACTIONS MODAL */}
      {modalAgentId && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[1000] flex items-end justify-center" onClick={() => setModalAgentId(null)}>
          <div className="w-full max-w-md bg-white rounded-t-[52px] p-8 pb-12 animate-in slide-in-from-bottom-full duration-300 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-6"></div>
            <div className="text-center mb-6">
               <h2 className="text-xl font-black text-slate-900 leading-none mb-1.5 uppercase tracking-tight truncate px-4">{activeModalAgent?.name}</h2>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">{activeModalAgent?.mobile}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {!isMaster && (
                <>
                  <QuickOption label="Cash Out Given" icon="📤" color="bg-rose-50 text-rose-600" onClick={() => onNewTx(modalAgentId, TransactionType.CASH_GIVEN)} />
                  <QuickOption label="Cash In Received" icon="📥" color="bg-emerald-50 text-emerald-600" onClick={() => onNewTx(modalAgentId, TransactionType.CASH_RECEIVED)} />
                  <QuickOption label="B2B Sending" icon="📱" color="bg-blue-50 text-blue-600" onClick={() => onNewTx(modalAgentId, TransactionType.B2B_SEND)} />
                  <QuickOption label="B2B Receiving" icon="📲" color="bg-indigo-50 text-indigo-600" onClick={() => onNewTx(modalAgentId, TransactionType.B2B_RECEIVE)} />
                  <QuickOption label="DUE" icon="📝" color="bg-slate-900 text-white" onClick={() => onNewTx(modalAgentId, TransactionType.DUE_ADJUSTMENT)} />
                  
                  <button 
                    onClick={() => setModalAgentId(null)}
                    className="w-full flex items-center justify-center p-3.5 rounded-[22px] font-black transition-all active:scale-[0.98] bg-slate-50 text-slate-400 mt-2 border border-slate-100 uppercase text-[10px] tracking-[0.2em]"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD AGENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[1500] flex items-end justify-center" onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-md bg-white rounded-t-[52px] p-10 pb-12 animate-in slide-in-from-bottom-full duration-300 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-8"></div>
            <h2 className="text-2xl font-black text-slate-900 text-center mb-8 tracking-tighter uppercase">Add New Agent</h2>
            
            <div className="space-y-6 mb-10">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Shop / Agent Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. M/S Karim Telecom"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-4 outline-none font-black text-slate-900 focus:ring-4 focus:ring-rose-50 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Mobile Number</label>
                <input 
                  type="tel" 
                  placeholder="01XXXXXXXXX"
                  value={addMobile}
                  onChange={(e) => setAddMobile(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-4 outline-none font-black text-slate-900 focus:ring-4 focus:ring-rose-50 transition-all"
                />
              </div>

              {isAdmin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Assign to DSO</label>
                  <select 
                    value={addDsoMobile}
                    onChange={(e) => setAddDsoMobile(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-4 outline-none font-black text-slate-900 focus:ring-4 focus:ring-rose-50 transition-all appearance-none"
                  >
                    {allDsos.map(dso => (
                      <option key={dso.id} value={dso.mobile}>{dso.name} ({dso.mobile})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Operating Area</label>
                <input 
                  type="text" 
                  placeholder="e.g. Netrokona"
                  value={addArea}
                  onChange={(e) => setAddArea(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-4 outline-none font-black text-slate-900 focus:ring-4 focus:ring-rose-50 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleAddSubmit}
                className="w-full bg-[#E2136E] text-white font-black py-6 rounded-[32px] shadow-2xl shadow-rose-200 active:scale-95 transition-all uppercase text-[11px] tracking-[0.2em]"
              >
                Confirm Agent
              </button>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-full py-2 text-slate-300 font-black uppercase text-[10px] tracking-widest"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const QuickOption = ({ label, icon, onClick, color }: { label: string, icon: string, onClick: () => void, color: string }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between p-3.5 rounded-[22px] font-black transition-all active:scale-[0.98] ${color} shadow-sm border border-black/5`}>
    <div className="flex items-center gap-4">
      <span className="text-lg">{icon}</span>
      <span className="text-[10px] uppercase tracking-widest">{label}</span>
    </div>
    <span className="opacity-20 text-[10px]">▶️</span>
  </button>
);

export default AgentListScreen;
