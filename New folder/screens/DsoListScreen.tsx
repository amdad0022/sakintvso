import React, { useState, useMemo } from 'react';
import { User } from '../types';

interface DsoListScreenProps {
  users: User[];
  onAdd: (name: string, mobile: string, pass: string) => void;
  onUpdate: (id: string, name: string, mobile: string) => void;
  onUpdateStatus: (id: string, newStatus: 'active' | 'suspended' | 'deleted') => void;
  onBack: () => void;
}

const DsoListScreen: React.FC<DsoListScreenProps> = ({ users, onAdd, onUpdate, onUpdateStatus, onBack }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'archive'>('active');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDso, setSelectedDso] = useState<User | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Custom confirmation modal state
  const [confirmAction, setConfirmAction] = useState<{
    show: boolean;
    dso: User | null;
    actionType: 'block' | 'unblock' | 'delete' | 'restore' | null;
    title: string;
    desc: string;
    nextStatus: 'active' | 'suspended' | 'deleted';
  }>({
    show: false,
    dso: null,
    actionType: null,
    title: '',
    desc: '',
    nextStatus: 'active'
  });

  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newPass, setNewPass] = useState('');

  const [editName, setEditName] = useState('');
  const [editMobile, setEditMobile] = useState('');

  const staffRegistry = useMemo(() => users.filter(u => u.status !== 'deleted'), [users]);
  const archiveRegistry = useMemo(() => users.filter(u => u.status === 'deleted'), [users]);

  const handleAddSubmit = () => {
    if (!newName.trim() || !newMobile.trim() || !newPass.trim()) {
      alert("Please provide all required staff details.");
      return;
    }
    onAdd(newName, newMobile, newPass);
    setShowAddModal(false);
    setNewName(''); setNewMobile(''); setNewPass('');
  };

  const openEdit = (dso: User) => {
    setSelectedDso(dso);
    setEditName(dso.name);
    setEditMobile(dso.mobile);
    setShowEditModal(true);
    setActiveMenuId(null);
  };

  const handleEditSubmit = () => {
    if (!selectedDso || !editName.trim() || !editMobile.trim()) return;
    onUpdate(selectedDso.id, editName, editMobile);
    setShowEditModal(false);
    setSelectedDso(null);
  };

  const handleActionTrigger = (e: React.MouseEvent, dso: User, action: 'block' | 'unblock' | 'delete' | 'restore') => {
    e.stopPropagation();
    setActiveMenuId(null);
    
    let title = "";
    let desc = "";
    let nextStatus: 'active' | 'suspended' | 'deleted' = 'active';

    switch (action) {
      case 'block':
        title = "Block Official?";
        desc = `Are you sure you want to block ${dso.name}? They will be immediately logged out and lose all access to their agent records.`;
        nextStatus = 'suspended';
        break;
      case 'unblock':
        title = "Restore Access?";
        desc = `This will reactivate ${dso.name}'s credentials and restore their access to assigned points.`;
        nextStatus = 'active';
        break;
      case 'delete':
        title = "Archive Staff Record?";
        desc = `Moving ${dso.name} to the archive will terminate their current session and hide them from the active registry. You can restore them later if needed.`;
        nextStatus = 'deleted';
        break;
      case 'restore':
        title = "Restore Staff?";
        desc = `Are you sure you want to move ${dso.name} back to the active distribution registry?`;
        nextStatus = 'active';
        break;
    }

    setConfirmAction({
      show: true,
      dso,
      actionType: action,
      title,
      desc,
      nextStatus
    });
  };

  const executeConfirmedAction = () => {
    if (confirmAction.dso) {
      onUpdateStatus(confirmAction.dso.id, confirmAction.nextStatus);
    }
    setConfirmAction({ ...confirmAction, show: false });
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden font-sans animate-in slide-in-from-right duration-500">
      <header className="p-6 bg-white border-b border-slate-100 shrink-0 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={(e) => { e.preventDefault(); onBack(); }} 
              className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-2xl text-slate-500 active:scale-90 transition-all border border-slate-100"
            >
              ←
            </button>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Staff Management</h1>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-[#E2136E] text-white text-[9px] font-black uppercase tracking-[0.2em] px-5 py-3 rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            Add Staff +
          </button>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-[20px] gap-1">
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3.5 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
          >
            Registry ({staffRegistry.length})
          </button>
          <button 
            onClick={() => setActiveTab('archive')}
            className={`flex-1 py-3.5 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'archive' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
          >
            Archive ({archiveRegistry.length})
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-32">
        {activeTab === 'active' ? (
          staffRegistry.length > 0 ? (
            staffRegistry.map(dso => (
              <div key={dso.id} className={`bg-white rounded-[32px] p-5 border shadow-sm flex items-center justify-between group relative transition-all ${dso.status === 'suspended' ? 'border-amber-200 bg-amber-50/20' : 'border-slate-100'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-[20px] text-lg font-black uppercase border ${dso.status === 'suspended' ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                    {dso.status === 'suspended' ? '🚫' : dso.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-800 leading-tight">{dso.name}</h3>
                      {dso.status === 'suspended' && (
                        <span className="text-[7px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">Blocked</span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{dso.mobile}</p>
                  </div>
                </div>
                
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === dso.id ? null : dso.id);
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-2xl text-slate-300 hover:text-slate-600 active:bg-slate-50 transition-all"
                  >
                    <span className="text-xl">⋮</span>
                  </button>

                  {activeMenuId === dso.id && (
                    <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                      <button onClick={() => openEdit(dso)} className="w-full px-5 py-3 text-left text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 flex items-center gap-3">
                        <span>✏️</span> Edit Profile
                      </button>
                      
                      {dso.status === 'suspended' ? (
                        <button onClick={(e) => handleActionTrigger(e, dso, 'unblock')} className="w-full px-5 py-3 text-left text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 border-t border-slate-50 flex items-center gap-3">
                          <span>✅</span> Restore Access
                        </button>
                      ) : (
                        <button onClick={(e) => handleActionTrigger(e, dso, 'block')} className="w-full px-5 py-3 text-left text-[10px] font-black text-amber-600 uppercase tracking-widest hover:bg-amber-50 border-t border-slate-50 flex items-center gap-3">
                          <span>🚫</span> Block Official
                        </button>
                      )}

                      <button onClick={(e) => handleActionTrigger(e, dso, 'delete')} className="w-full px-5 py-3 text-left text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 border-t border-slate-50 flex items-center gap-3">
                        <span>🗑️</span> Send to Archive
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-24 text-center opacity-30 flex flex-col items-center">
              <span className="text-5xl mb-4">👥</span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Registry Is Empty</p>
            </div>
          )
        ) : (
          archiveRegistry.length > 0 ? (
            archiveRegistry.map(dso => (
              <div key={dso.id} className="bg-white rounded-[32px] p-5 border border-slate-100 shadow-sm flex items-center justify-between group relative transition-all opacity-80">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-[20px] text-lg font-black uppercase border bg-slate-50 text-slate-300">
                    📁
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 leading-tight">{dso.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{dso.mobile}</p>
                  </div>
                </div>
                
                <button 
                  onClick={(e) => handleActionTrigger(e, dso, 'restore')}
                  className="bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest px-5 py-3 rounded-2xl shadow-lg active:scale-95 transition-all"
                >
                  Restore Access
                </button>
              </div>
            ))
          ) : (
            <div className="py-24 text-center opacity-30 flex flex-col items-center">
              <span className="text-5xl mb-4">📂</span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Archive Is Empty</p>
            </div>
          )
        )}
      </div>

      {/* CONFIRMATION WARNING MODAL */}
      {confirmAction.show && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl z-[2000] flex items-center justify-center px-8 animate-in fade-in duration-300">
          <div className="w-full bg-white rounded-[44px] p-10 shadow-2xl animate-in zoom-in-95 border border-slate-100 text-center relative overflow-hidden max-w-[340px]">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${confirmAction.actionType === 'delete' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-8 shadow-inner ${confirmAction.actionType === 'delete' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
              {confirmAction.actionType === 'delete' ? '🗑️' : '⚠️'}
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter">{confirmAction.title}</h2>
            <p className="text-slate-400 text-[10px] font-bold mb-10 uppercase tracking-[0.15em] leading-relaxed px-2">
              {confirmAction.desc}
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={executeConfirmedAction}
                className={`w-full text-white font-black py-5 rounded-[24px] shadow-2xl text-[11px] uppercase tracking-widest active:scale-[0.97] transition-all ${confirmAction.actionType === 'delete' ? 'bg-rose-600 shadow-rose-200' : 'bg-slate-900 shadow-slate-200'}`}
              >
                Confirm {confirmAction.actionType === 'delete' ? 'Archiving' : 'Action'}
              </button>
              <button 
                onClick={() => setConfirmAction({ ...confirmAction, show: false })}
                className="w-full py-4 text-slate-400 font-black text-[9px] uppercase tracking-[0.3em] active:opacity-60 transition-opacity"
              >
                Cancel & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[1000] flex items-end justify-center px-4" onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-md bg-white rounded-t-[48px] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8"></div>
            <h2 className="text-2xl font-black text-slate-900 text-center mb-8 tracking-tight">Onboard Officer</h2>
            <div className="space-y-6 mb-10">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Full Legal Name</label>
                <input type="text" placeholder="e.g. Ariful Islam" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-6 py-4 outline-none font-bold text-slate-800 transition-all text-sm"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Official Mobile ID</label>
                <input type="tel" placeholder="017XXXXXXXX" value={newMobile} onChange={(e) => setNewMobile(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-6 py-4 outline-none font-bold text-slate-800 transition-all text-sm"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Access Credential</label>
                <input type="password" placeholder="Set initial password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-6 py-4 outline-none font-bold text-slate-800 transition-all text-sm"/>
              </div>
            </div>
            <div className="space-y-4">
              <button onClick={handleAddSubmit} className="w-full bg-[#E2136E] text-white font-black py-5 rounded-[24px] shadow-2xl transition-all text-xs uppercase tracking-[0.2em]">Confirm Onboarding</button>
              <button onClick={() => setShowAddModal(false)} className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[1000] flex items-end justify-center px-4" onClick={() => setShowEditModal(false)}>
          <div className="w-full max-w-md bg-white rounded-t-[48px] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8"></div>
            <h2 className="text-2xl font-black text-slate-900 text-center mb-8 tracking-tight">Update Info</h2>
            <div className="space-y-6 mb-10">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Legal Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-6 py-4 outline-none font-bold text-slate-800 transition-all text-sm"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Mobile Identifier</label>
                <input type="tel" value={editMobile} onChange={(e) => setEditMobile(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-6 py-4 outline-none font-bold text-slate-800 transition-all text-sm"/>
              </div>
            </div>
            <div className="space-y-4">
              <button onClick={handleEditSubmit} className="w-full bg-slate-900 text-white font-black py-5 rounded-[24px] shadow-2xl transition-all text-xs uppercase tracking-[0.2em]">Update Database</button>
              <button onClick={() => { setShowEditModal(false); setSelectedDso(null); }} className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DsoListScreen;