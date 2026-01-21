
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { User, UserRole, Agent, Transaction, TransactionType, HistorySnapshot } from './types.ts';
import { MOCK_USERS, MOCK_AGENTS } from './constants.tsx';
import LoginScreen from './screens/LoginScreen.tsx';
import DashboardScreen from './screens/DashboardScreen.tsx';
import MasterDashboardScreen from './screens/MasterDashboardScreen.tsx';
import MasterDsoListScreen from './screens/MasterDsoListScreen.tsx';
import AgentListScreen from './screens/AgentListScreen.tsx';
import TransactionEntryScreen from './screens/TransactionEntryScreen.tsx';
import LedgerScreen from './screens/LedgerScreen.tsx';
import HistoryScreen from './screens/HistoryScreen.tsx';
import ProfileScreen from './screens/ProfileScreen.tsx';
import BulkImportScreen from './screens/BulkImportScreen.tsx';
import MasterDSOPicker from './components/MasterDSOPicker.tsx';
import AllTransactionsScreen from './screens/AllTransactionsScreen.tsx';
import BulkDsoImportScreen from './screens/BulkDsoImportScreen.tsx';
import CleanupToolScreen from './screens/CleanupToolScreen.tsx';
import DsoPasswordManagerScreen from './screens/DsoPasswordManagerScreen.tsx';
import AdminPasswordResetScreen from './screens/AdminPasswordResetScreen.tsx';
import DsoListScreen from './screens/DsoListScreen.tsx';
import DueDetailsScreen from './screens/DueDetailsScreen.tsx';
import AppCreatorScreen from './screens/AppCreatorScreen.tsx';

// Persistent Storage Keys - versioned to prevent conflicts
const SESSION_KEY = 'nagad_elite_session_v7';
const OPERATING_DSO_KEY = 'nagad_elite_operating_dso_v7';
const GLOBAL_AGENTS_KEY = 'nagad_global_agents_v7';
const GLOBAL_TRANSACTIONS_KEY = 'nagad_global_transactions_v7';
const GLOBAL_USERS_KEY = 'nagad_global_users_v7';
const GLOBAL_HISTORY_KEY = 'nagad_global_history_v7';

const App: React.FC = () => {
  // --- STATE INITIALIZATION WITH PERSISTENCE ---
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(GLOBAL_USERS_KEY);
      return saved ? JSON.parse(saved) : MOCK_USERS;
    } catch (e) { return MOCK_USERS; }
  });

  const [agents, setAgents] = useState<Agent[]>(() => {
    try {
      const saved = localStorage.getItem(GLOBAL_AGENTS_KEY);
      return saved ? JSON.parse(saved) : MOCK_AGENTS;
    } catch (e) { return MOCK_AGENTS; }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(GLOBAL_TRANSACTIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [historySnapshots, setHistorySnapshots] = useState<HistorySnapshot[]>(() => {
    try {
      const saved = localStorage.getItem(GLOBAL_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [operatingAsDSO, setOperatingAsDSO] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(OPERATING_DSO_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });
  
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');
  const [txInitialFilter, setTxInitialFilter] = useState<TransactionType | 'ALL'>('ALL');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [masterSelectedDsoMobile, setMasterSelectedDsoMobile] = useState<string | null>(null);

  // Robust persistence helper
  const persist = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Storage error for key ${key}:`, e);
      if (e instanceof DOMException && (e.name === 'QuotaExceededError')) {
         alert("সতর্কতা: স্টোরেজ ফুল! অপ্রয়োজনীয় ডাটা বা প্রোফাইল পিকচার মুছে ফেলুন।");
      }
    }
  }, []);

  // --- AUTOMATIC SYNC EFFECTS ---
  useEffect(() => { persist(GLOBAL_USERS_KEY, users); }, [users, persist]);
  useEffect(() => { persist(GLOBAL_AGENTS_KEY, agents); }, [agents, persist]);
  useEffect(() => { persist(GLOBAL_TRANSACTIONS_KEY, transactions); }, [transactions, persist]);
  useEffect(() => { persist(GLOBAL_HISTORY_KEY, historySnapshots); }, [historySnapshots, persist]);
  
  useEffect(() => {
    if (user) persist(SESSION_KEY, user);
    else localStorage.removeItem(SESSION_KEY);
  }, [user, persist]);

  useEffect(() => {
    if (operatingAsDSO) persist(OPERATING_DSO_KEY, operatingAsDSO);
    else localStorage.removeItem(OPERATING_DSO_KEY);
  }, [operatingAsDSO, persist]);

  const parseHash = useCallback(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash || hash === '/') return { screen: 'dashboard' };
    const parts = hash.split('?');
    const screen = parts[0];
    const params = new URLSearchParams(parts[1] || '');
    return {
      screen,
      txInitialFilter: (params.get('filter') as any) || 'ALL',
      selectedAgentId: params.get('agentId'),
      editingTxId: params.get('editId')
    };
  }, []);

  const syncStateFromHash = useCallback(() => {
    const state = parseHash();
    setCurrentScreen(state.screen);
    setTxInitialFilter(state.txInitialFilter || 'ALL');
    setSelectedAgentId(state.selectedAgentId || null);
    setEditingTxId(state.editingTxId || null);
  }, [parseHash]);

  useEffect(() => {
    window.addEventListener('hashchange', syncStateFromHash);
    syncStateFromHash();
    return () => window.removeEventListener('hashchange', syncStateFromHash);
  }, [syncStateFromHash]);

  const handleNavigate = useCallback((screen: string, filter: TransactionType | 'ALL' = 'ALL') => {
    if (user?.role === UserRole.MASTER) {
      if (screen === 'entry') return; 
      if (screen === 'agents' && !masterSelectedDsoMobile) {
        window.location.hash = 'master-dso-list';
        return;
      }
    }
    const filterParam = filter !== 'ALL' ? `?filter=${filter}` : '';
    window.location.hash = `${screen}${filterParam}`;
  }, [user, masterSelectedDsoMobile]);

  const handleNavigateWithParams = useCallback((screen: string, params: Record<string, string | null>) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) searchParams.set(k, v);
    });
    const queryString = searchParams.toString();
    window.location.hash = `${screen}${queryString ? '?' + queryString : ''}`;
  }, []);

  const handleLogin = (mobile: string, pass: string) => {
    const foundUser = users.find(u => u.mobile === mobile.trim());
    if (!foundUser || foundUser.password !== pass.trim()) {
      setLoginError("পাসওয়ার্ড বা মোবাইল নাম্বার ভুল!");
      return;
    }
    setLoginError(null);
    setUser(foundUser);
    setMasterSelectedDsoMobile(null);
    if (foundUser.role === UserRole.DSO) {
      setOperatingAsDSO(foundUser);
    } else {
      const firstDso = users.find(u => u.role === UserRole.DSO && u.status === 'active');
      setOperatingAsDSO(firstDso || null);
    }
    window.location.hash = 'dashboard';
  };

  const handleLogout = () => {
    setUser(null);
    setOperatingAsDSO(null);
    setMasterSelectedDsoMobile(null);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(OPERATING_DSO_KEY);
    window.location.hash = 'login';
  };

  const handleUpdateAgent = (updated: Agent) => {
    setAgents(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (user?.id === updatedUser.id) setUser(updatedUser);
    if (operatingAsDSO?.id === updatedUser.id) setOperatingAsDSO(updatedUser);
  };

  const handleTransactionSubmit = (txData: { agentId: string, type: TransactionType, amount: number, note: string }) => {
    if (user?.role === UserRole.MASTER) return;
    if (editingTxId) {
      const oldTx = transactions.find(t => t.id === editingTxId);
      if (oldTx) {
        const oldImpact = (oldTx.type === TransactionType.DUE_ADJUSTMENT) ? oldTx.amount : 0;
        setAgents(prev => prev.map(a => a.id === oldTx.agentId ? { ...a, currentDue: a.currentDue - oldImpact } : a));
      }
      const newImpact = (txData.type === TransactionType.DUE_ADJUSTMENT) ? txData.amount : 0;
      setAgents(prev => prev.map(a => a.id === txData.agentId ? { ...a, currentDue: a.currentDue + newImpact } : a));
      setTransactions(prev => prev.map(t => t.id === editingTxId ? { ...t, ...txData } : t));
      setEditingTxId(null);
    } else {
      const newTx = { 
        ...txData, 
        id: Math.random().toString(36).substr(2, 9), 
        timestamp: new Date().toISOString(), 
        dsoId: activeDSO?.id || 'sys' 
      };
      const impact = (txData.type === TransactionType.DUE_ADJUSTMENT) ? txData.amount : 0;
      setAgents(p => p.map(a => a.id === txData.agentId ? { ...a, currentDue: a.currentDue + impact } : a));
      setTransactions(p => [newTx, ...p]);
    }
    handleNavigate('all-transactions', txData.type);
  };

  const activeDSO = useMemo(() => {
    const currentUser = (user?.role === UserRole.MASTER || user?.role === UserRole.ADMIN) ? operatingAsDSO : user;
    if (!currentUser) return null;
    return users.find(u => u.mobile === currentUser.mobile) || currentUser;
  }, [user, operatingAsDSO, users]);

  const allActiveDSOs = useMemo(() => {
    return users.filter(u => u.role === UserRole.DSO && u.status === 'active');
  }, [users]);

  const filteredAgents = useMemo(() => {
    if (user?.role === UserRole.MASTER) {
      if (masterSelectedDsoMobile) {
        return agents.filter(a => a.assignedDsoMobile === masterSelectedDsoMobile);
      }
      return agents;
    }
    if (!activeDSO) return [];
    return agents.filter(a => a.assignedDsoMobile === activeDSO.mobile);
  }, [agents, activeDSO, user, masterSelectedDsoMobile]);

  const dsoTransactions = useMemo(() => {
    if (user?.role === UserRole.MASTER) return transactions;
    if (!activeDSO) return [];
    return transactions.filter(t => t.dsoId === activeDSO.id);
  }, [transactions, activeDSO, user]);

  if (!user) return <LoginScreen onLogin={handleLogin} loginError={loginError} />;

  const showNavbar = !['entry', 'bulk-import', 'bulk-dso-import', 'ledger', 'due-details', 'cleanup', 'dso-passwords', 'admin-reset', 'dso-list', 'creator'].includes(currentScreen);

  return (
    <div className="h-full w-full max-md mx-auto relative bg-[#F8FAFC] flex flex-col shadow-2xl overflow-hidden border-x border-slate-200">
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {(user?.role === UserRole.ADMIN || user?.role === UserRole.MASTER) && (
          <MasterDSOPicker 
            role={user.role}
            currentDSO={activeDSO} 
            onSelect={(dso) => { 
              setOperatingAsDSO(dso); 
              handleNavigate('dashboard');
            }} 
            dsos={allActiveDSOs} 
          />
        )}

        <main className="flex-1 relative overflow-hidden flex flex-col">
          {currentScreen === 'dashboard' && (
             user.role === UserRole.MASTER 
             ? <MasterDashboardScreen user={user} transactions={transactions} agents={agents} dsos={allActiveDSOs} onNavigate={handleNavigate} />
             : <DashboardScreen user={user} operatingAsDSO={activeDSO} transactions={dsoTransactions} agents={filteredAgents} onNavigate={handleNavigate} />
          )}
          {currentScreen === 'master-dso-list' && <MasterDsoListScreen dsos={allActiveDSOs} transactions={transactions} onSelectDso={(mobile) => { setMasterSelectedDsoMobile(mobile); handleNavigate('agents'); }} onBack={() => handleNavigate('dashboard')} />}
          {currentScreen === 'all-transactions' && <AllTransactionsScreen user={user} initialFilter={txInitialFilter} transactions={dsoTransactions} agents={agents} onBack={() => handleNavigate('dashboard')} onNewEntry={(forcedType) => { if(user.role === UserRole.MASTER) return; handleNavigateWithParams('entry', { filter: forcedType || null }); }} onSelectAgentLedger={(id) => { handleNavigateWithParams('ledger', { agentId: id }); }} onNavigateToAgents={() => handleNavigate('agents')} />}
          {currentScreen === 'agents' && <AgentListScreen user={user} agents={filteredAgents} allDsos={allActiveDSOs} onSelectAgent={(id) => { handleNavigateWithParams('ledger', { agentId: id }); }} onNewTx={(id, type) => { if(user.role === UserRole.MASTER) return; handleNavigateWithParams('entry', { agentId: id, filter: type }); }} onAddAgent={(a) => { if(user.role === UserRole.MASTER) return; setAgents(p => [...p, { ...a, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString(), status: 'active' }]); }} onBack={() => handleNavigate('dashboard')} onBulkDelete={(ids) => { if(user.role === UserRole.MASTER) return; setAgents(p => p.filter(a => !ids.includes(a.id))); }} onBulkImport={() => { if(user.role === UserRole.MASTER) return; handleNavigate('bulk-import'); }} />}
          {currentScreen === 'entry' && <TransactionEntryScreen userRole={user.role} key={`${selectedAgentId}-${txInitialFilter}-${editingTxId}`} agents={agents} preselectedAgentId={selectedAgentId} preselectedType={txInitialFilter !== 'ALL' ? txInitialFilter : null} editingTx={editingTxId ? transactions.find(t => t.id === editingTxId) : undefined} onSubmit={handleTransactionSubmit} onBack={() => handleNavigate('agents')} />}
          {currentScreen === 'ledger' && selectedAgentId && <LedgerScreen user={user} agent={agents.find(a => a.id === selectedAgentId)!} transactions={transactions.filter(t => t.agentId === selectedAgentId)} onDelete={(id) => setTransactions(prev => prev.filter(t => t.id !== id))} onEdit={(id) => handleNavigateWithParams('entry', { editId: id, agentId: selectedAgentId })} onBack={() => handleNavigate('agents')} />}
          {currentScreen === 'history' && <HistoryScreen user={user} snapshots={historySnapshots.filter(s => user.role === UserRole.MASTER ? true : s.dsoId === activeDSO?.id)} activeTransactions={transactions} agents={agents} onDeleteSnapshot={(id) => setHistorySnapshots(p => p.filter(s => s.id !== id))} onDeleteTransaction={(id) => setTransactions(p => p.filter(t => t.id !== id))} onEditTransaction={(id) => { const tx = transactions.find(t => t.id === id); if(tx) handleNavigateWithParams('entry', { editId: id, agentId: tx.agentId }); }} onBack={() => handleNavigate('dashboard')} />}
          {currentScreen === 'profile' && <ProfileScreen user={user} agents={filteredAgents} onLogout={handleLogout} onBack={() => handleNavigate('dashboard')} onUpdateAgent={handleUpdateAgent} onUpdateUser={handleUpdateUser} onOpenBulkImport={() => handleNavigate('bulk-import')} onOpenBulkDsoImport={() => handleNavigate('bulk-dso-import')} onOpenCleanup={() => handleNavigate('cleanup')} onOpenDsoPasswords={() => handleNavigate('dso-passwords')} onOpenAdminReset={() => handleNavigate('admin-reset')} onOpenDsoList={() => handleNavigate('dso-list')} onOpenAppCreator={() => handleNavigate('creator')} />}
          {currentScreen === 'bulk-import' && <BulkImportScreen existingAgents={agents} onImport={(newA) => { setAgents(prev => { const next = [...prev]; newA.forEach(agent => { if (!next.some(existing => existing.mobile === agent.mobile)) next.push(agent); }); return next; }); handleNavigate('agents'); }} onBack={() => handleNavigate('agents')} />}
          {currentScreen === 'bulk-dso-import' && <BulkDsoImportScreen onImport={(dsoPayload) => { setUsers(prev => { const next = [...prev]; dsoPayload.forEach(pd => { const existingIdx = next.findIndex(u => u.mobile === pd.mobile); if (existingIdx > -1) next[existingIdx] = { ...next[existingIdx], name: pd.name }; else next.push({ id: Math.random().toString(36).substr(2, 9), name: pd.name, mobile: pd.mobile, password: '112233', role: UserRole.DSO, status: 'active' }); }); return next; }); handleNavigate('profile'); }} onBack={() => handleNavigate('profile')} />}
          {currentScreen === 'cleanup' && <CleanupToolScreen agents={agents} onConfirmDelete={(ids) => { setAgents(p => p.filter(a => !ids.includes(a.id))); handleNavigate('profile'); }} onDeleteAll={() => { setAgents([]); setTransactions([]); setHistorySnapshots([]); handleNavigate('profile'); }} onBack={() => handleNavigate('profile')} />}
          {currentScreen === 'dso-passwords' && <DsoPasswordManagerScreen dsos={users.filter(u => u.role === UserRole.DSO)} onUpdatePassword={(id, pass) => setUsers(prev => prev.map(u => u.id === id ? { ...u, password: pass } : u))} onBack={() => handleNavigate('profile')} />}
          {currentScreen === 'admin-reset' && <AdminPasswordResetScreen onReset={(curr, next) => { if (curr === user?.password) { setUsers(prev => prev.map(u => u.id === user!.id ? { ...u, password: next } : u)); alert('পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে'); handleNavigate('profile'); } else { alert('পুরাতন পাসওয়ার্ডটি সঠিক নয়'); } }} onBack={() => handleNavigate('profile')} />}
          {currentScreen === 'dso-list' && <DsoListScreen users={users.filter(u => u.role === UserRole.DSO)} onAdd={(name, mobile, pass) => setUsers(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), name, mobile, password: pass, role: UserRole.DSO, status: 'active' }])} onUpdate={(id, name, mobile) => setUsers(prev => prev.map(u => u.id === id ? { ...u, name, mobile } : u))} onUpdateStatus={(id, status) => setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u))} onBack={() => handleNavigate('profile')} />}
          {currentScreen === 'due-details' && <DueDetailsScreen user={user} agents={agents} onEdit={(id) => { handleNavigateWithParams('ledger', { agentId: id }); }} onReset={(id) => { if(user.role === UserRole.MASTER) return; if(window.confirm('আপনি কি এই এজেন্টের ব্যালেন্স রিসেট করতে চান?')) { setAgents(p => p.map(a => a.id === id ? { ...a, currentDue: 0 } : a)); } }} onBack={() => handleNavigate('dashboard')} />}
          {currentScreen === 'creator' && <AppCreatorScreen onBack={() => handleNavigate('profile')} />}
        </main>

        {showNavbar && (
          <div className="nav-wrapper">
            <nav className="nav-bar-static">
              <NavBtn active={currentScreen === 'dashboard'} icon="🏠" onClick={() => handleNavigate('dashboard')} />
              <NavBtn active={['agents', 'master-dso-list'].includes(currentScreen)} icon="👥" onClick={() => handleNavigate('agents')} />
              {user.role !== UserRole.MASTER && (
                <div className="relative -top-6">
                  <button onClick={() => setShowResetModal(true)} className="w-14 h-14 ruby-gradient text-white rounded-full flex items-center justify-center shadow-xl shadow-rose-400 active:scale-90 transition-all border-[4px] border-white">
                    <span className="text-xl">🧹</span>
                  </button>
                </div>
              )}
              <NavBtn active={currentScreen === 'history'} icon="📁" onClick={() => handleNavigate('history')} />
              <NavBtn active={currentScreen === 'profile'} icon="⚙️" onClick={() => handleNavigate('profile')} />
            </nav>
          </div>
        )}
      </div>

      {showResetModal && user.role !== UserRole.MASTER && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[2000] flex items-center justify-center px-8">
          <div className="w-full bg-white rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 border border-slate-100 max-w-[320px]">
            <h2 className="text-xl font-black text-slate-900 text-center mb-2 tracking-tight">Daily Settlement</h2>
            <p className="text-slate-400 text-[10px] text-center font-bold mb-8 uppercase tracking-[0.2em]">Clear and archive logs</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => {
                if (activeDSO) {
                  const dsoTxs = transactions.filter(t => t.dsoId === activeDSO.id);
                  const snapshot = {
                    id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString(), dsoId: activeDSO.id, dsoName: activeDSO.name, totalDue: filteredAgents.reduce((s, a) => s + a.currentDue, 0),
                    stats: {
                      cashGiven: dsoTxs.filter(t => t.type === TransactionType.CASH_GIVEN).reduce((s, t) => s + t.amount, 0),
                      cashReceived: dsoTxs.filter(t => t.type === TransactionType.CASH_RECEIVED).reduce((s, t) => s + t.amount, 0),
                      b2bSend: dsoTxs.filter(t => t.type === TransactionType.B2B_SEND).reduce((s, t) => s + t.amount, 0),
                      b2bReceive: dsoTxs.filter(t => t.type === TransactionType.B2B_RECEIVE).reduce((s, t) => s + t.amount, 0),
                    },
                    transactions: [...dsoTxs],
                  };
                  setHistorySnapshots(p => [snapshot, ...p]);
                  setTransactions(p => p.filter(t => t.dsoId !== activeDSO.id));
                  setAgents(p => p.map(a => filteredAgents.some(fa => fa.id === a.id) ? { ...a, currentDue: 0 } : a));
                  setShowResetModal(false);
                  handleNavigate('dashboard');
                }
              }} className="w-full ruby-gradient text-white font-black py-4 rounded-2xl shadow-xl text-[10px] uppercase tracking-widest active:scale-95">Confirm</button>
              <button onClick={() => setShowResetModal(false)} className="w-full py-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavBtn = ({ active, icon, onClick }: { active: boolean, icon: string, onClick: () => void }) => (
  <button onClick={onClick} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-rose-50 text-[#E2136E]' : 'text-slate-300'}`}>
    <span className="text-xl">{icon}</span>
  </button>
);

export default App;
