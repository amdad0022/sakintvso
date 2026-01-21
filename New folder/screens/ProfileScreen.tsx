
import React, { useState, useRef, useMemo } from 'react';
import { User, UserRole, Agent } from '../types';

interface ProfileScreenProps {
  user: User | null;
  agents: Agent[];
  onLogout: () => void;
  onBack: () => void;
  onUpdateAgent: (agent: Agent) => void;
  onUpdateUser: (user: User) => void;
  onOpenBulkImport: () => void;
  onOpenBulkDsoImport: () => void;
  onOpenCleanup: () => void;
  onOpenDsoPasswords: () => void;
  onOpenAdminReset: () => void;
  onOpenDsoList: () => void;
  onOpenAppCreator: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  user, agents, onLogout, onBack, onUpdateAgent, onUpdateUser, onOpenBulkImport, onOpenBulkDsoImport, onOpenCleanup, onOpenDsoPasswords, onOpenAdminReset, onOpenDsoList, onOpenAppCreator
}) => {
  const [showPassChange, setShowPassChange] = useState(false);
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [showManageAgents, setShowManageAgents] = useState(false);
  const [editAgent, setEditAgent] = useState<Agent | null>(null);
  const [agentSearch, setAgentSearch] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security Verification State
  const [showPinModal, setShowPinModal] = useState(false);
  const [verificationAction, setVerificationAction] = useState<'DSO_NAME' | 'AGENT_EDIT' | null>(null);
  const [verifyPinInput, setVerifyPinInput] = useState('');

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  
  const [tempName, setTempName] = useState(user?.name || '');

  if (!user) return null;

  const isAdmin = user.role === UserRole.ADMIN;
  const isMaster = user.role === UserRole.MASTER;

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("ইমেজটি অনেক বড়! দয়া করে ২ এমবি-র নিচের ফাইল সিলেক্ট করুন।");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onUpdateUser({ ...user, profilePic: reader.result });
        }
      };
      reader.onerror = () => alert("ফাইল আপলোড ব্যর্থ হয়েছে!");
      reader.readAsDataURL(file);
    }
  };

  const triggerSecurityCheck = (action: 'DSO_NAME' | 'AGENT_EDIT') => {
    setVerificationAction(action);
    setVerifyPinInput('');
    setShowPinModal(true);
  };

  const handlePinVerify = () => {
    if (verifyPinInput === user.password) {
      setShowPinModal(false);
      setVerifyPinInput('');
      
      if (verificationAction === 'DSO_NAME') {
        setTempName(user.name);
        setShowNameEdit(true);
      } else if (verificationAction === 'AGENT_EDIT') {
        setShowManageAgents(true);
      }
      setVerificationAction(null);
    } else {
      alert("ভুল পিন! দয়া করে সঠিক পিন দিন।");
    }
  };

  const handlePassUpdate = () => {
    if (currentPass !== user.password) {
      return alert("পুরাতন পাসওয়ার্ড সঠিক নয়");
    }
    if (newPass.length < 4) {
      return alert("নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে");
    }
    if (newPass !== confirmPass) {
      return alert("নতুন পাসওয়ার্ড দুটি মিলেনি");
    }
    
    onUpdateUser({ ...user, password: newPass });
    alert("পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে");
    setShowPassChange(false);
    setCurrentPass(''); setNewPass(''); setConfirmPass('');
  };

  const handleNameUpdate = () => {
    if (!tempName.trim()) {
      return alert("নাম খালি রাখা যাবে না");
    }
    onUpdateUser({ ...user, name: tempName.trim() });
    alert("নাম সফলভাবে পরিবর্তন হয়েছে");
    setShowNameEdit(false);
  };

  const handleAgentSave = () => {
    if (editAgent) {
      if (!editAgent.name.trim() || !editAgent.mobile.trim()) {
        return alert("নাম এবং মোবাইল নাম্বার বাধ্যতামূলক");
      }
      onUpdateAgent(editAgent);
      setEditAgent(null);
    }
  };

  const filteredManageAgents = useMemo(() => {
    return agents.filter(a => 
      a.name.toLowerCase().includes(agentSearch.toLowerCase()) || 
      a.mobile.includes(agentSearch)
    );
  }, [agents, agentSearch]);

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden font-sans relative">
      <header className="p-8 bg-[#E2136E] border-b border-rose-600 flex items-center justify-between shrink-0 z-20 shadow-xl">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-[#E2136E] active:scale-95 transition-all shadow-lg font-black text-xl">
            ◀️
          </button>
          <h1 className="text-2xl font-black text-white tracking-tight leading-none uppercase">Identity Hub</h1>
        </div>
        <button 
          onClick={onLogout}
          className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-[#E2136E] shadow-lg border border-rose-100 active:scale-95 transition-all font-black text-xl"
        >
          🔚
        </button>
      </header>

      <div className="content-area p-8 space-y-8 custom-scrollbar pb-32">
        {/* PREMIUM PROFILE HEADER CARD (DSO CARD) */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#E2136E] to-rose-400 rounded-[52px] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-white p-10 rounded-[48px] shadow-2xl overflow-hidden flex flex-col items-center border-4 border-rose-50/50">
            <div className="absolute top-0 right-0 w-40 h-40 bg-rose-50 rounded-full -mr-10 -mt-10 blur-3xl opacity-60"></div>
            
            <div className="relative mb-6">
              <div className="w-28 h-28 bg-gradient-to-br from-[#E2136E] to-[#C1105E] text-white text-5xl font-black flex items-center justify-center rounded-[36px] shadow-2xl border-4 border-white ring-8 ring-rose-50 overflow-hidden">
                {user.profilePic ? (
                  <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-11 h-11 bg-white text-[#E2136E] rounded-2xl flex items-center justify-center shadow-xl border-2 border-rose-100 active:scale-90 transition-all text-lg"
              >
                📸
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleProfilePicUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>

            <h2 className="text-2xl font-black text-slate-900 leading-tight text-center tracking-tighter mb-1 uppercase">
              {user.name}
            </h2>
            <p className="text-[#E2136E] font-black uppercase text-[11px] tracking-[0.4em] mb-8 bg-rose-50 px-4 py-1 rounded-full border border-rose-100">
              {user.mobile}
            </p>
            <div className="flex gap-3">
              <span className="bg-[#E2136E] text-white text-[9px] font-black px-6 py-3 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-rose-200 border-2 border-white">
                {user.role} ACCESS
              </span>
            </div>
          </div>
        </div>

        {/* GOLDEN PREMIUM APP CREATOR OPTION - PLACED BELOW DSO CARD */}
        <button 
          onClick={onOpenAppCreator} 
          className="w-full group relative overflow-hidden active:scale-[0.98] transition-all shine-effect rounded-[40px] shadow-[0_20px_40px_rgba(184,134,11,0.2)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#B8860B] via-[#FFD700] to-[#B8860B]"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-bl-[100px]"></div>
          <div className="relative p-7 flex items-center justify-between border-2 border-[#FFD700] rounded-[40px]">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-2xl border border-white/40 shadow-inner group-hover:scale-110 transition-transform">
                🏆
              </div>
              <div className="text-left">
                <h3 className="text-[#5C4033] font-black text-sm uppercase tracking-tight">App Creator</h3>
                <p className="text-[#5C4033]/60 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Creator Information Hub</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-[#5C4033]/10 rounded-full flex items-center justify-center border border-[#5C4033]/10 text-[#5C4033]">
              ▶
            </div>
          </div>
        </button>

        {/* SETTINGS OPTIONS */}
        <section className="space-y-4">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] ml-2">Settings & Identity</p>
          <div className="grid grid-cols-1 gap-4">
             {!isMaster && (
               <button onClick={() => triggerSecurityCheck('DSO_NAME')} className="w-full bg-white p-7 rounded-[36px] border-2 border-emerald-100 flex justify-between items-center active:scale-[0.98] transition-all shadow-sm group">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-2xl border border-emerald-100 group-hover:scale-110 transition-transform">👤</div>
                    <div className="text-left">
                       <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">নাম পরিবর্তন</h3>
                       <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-1">Update DSO Identity</p>
                    </div>
                 </div>
                 <span className="text-slate-200 text-xl">▶️</span>
               </button>
             )}
             {!isMaster && (
               <button onClick={() => triggerSecurityCheck('AGENT_EDIT')} className="w-full bg-white p-7 rounded-[36px] border-2 border-indigo-100 flex justify-between items-center active:scale-[0.98] transition-all shadow-sm group">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-2xl border border-indigo-100 group-hover:scale-110 transition-transform">✍️</div>
                    <div className="text-left">
                       <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">এজেন্ট সংশোধন</h3>
                       <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-1">Update Agent Profile</p>
                    </div>
                 </div>
                 <span className="text-slate-200 text-xl">▶️</span>
               </button>
             )}
             <button onClick={() => setShowPassChange(true)} className="w-full bg-white p-7 rounded-[36px] border-2 border-slate-200 flex justify-between items-center active:scale-[0.98] transition-all shadow-sm group">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-slate-50 text-slate-800 rounded-3xl flex items-center justify-center text-2xl border border-slate-200 group-hover:scale-110 transition-transform">🔒</div>
                   <div className="text-left">
                      <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">পাসওয়ার্ড পরিবর্তন</h3>
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-1">Security Key Reset</p>
                   </div>
                </div>
                <span className="text-slate-200 text-xl">▶️</span>
             </button>
          </div>
        </section>

        {/* ADMIN TERMINAL */}
        {(isAdmin || isMaster) && (
          <section className="space-y-4">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] ml-2">Admin Terminal</p>
            <div className="grid grid-cols-1 gap-4">
              <AdminActionCard title="Personnel Roster" desc="Staff Management" icon="👥" color="border-indigo-200" onClick={onOpenDsoList} />
              <AdminActionCard title="Data Hub" desc="Mass Data Import" icon="📊" color="border-emerald-200" onClick={onOpenBulkImport} />
              <AdminActionCard title="Cloud Purge" desc="Wipe System Data" icon="🧹" color="border-rose-200" onClick={onOpenCleanup} />
            </div>
          </section>
        )}
      </div>

      {/* MANAGE AGENTS MODAL */}
      {showManageAgents && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xl z-[1200] flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-300">
           <header className="p-8 bg-[#E2136E] text-white flex items-center justify-between shadow-xl shrink-0">
             <h2 className="text-xl font-black uppercase tracking-tight">Manage Agents</h2>
             <button onClick={() => setShowManageAgents(false)} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black">✕</button>
           </header>
           
           <div className="p-6 bg-white shrink-0 border-b border-slate-100">
             <input 
               type="text" 
               placeholder="এজেন্ট নাম বা মোবাইল দিয়ে খুঁজুন..." 
               value={agentSearch}
               onChange={(e) => setAgentSearch(e.target.value)}
               className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none font-bold text-slate-800 focus:border-indigo-500 transition-all"
             />
           </div>

           <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-4 custom-scrollbar">
              {filteredManageAgents.map(a => (
                <button 
                  key={a.id} 
                  onClick={() => setEditAgent(a)}
                  className="w-full bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all"
                >
                  <div className="text-left">
                    <p className="font-black text-slate-800 uppercase text-sm">{a.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-1">{a.mobile}</p>
                  </div>
                  <div className="bg-indigo-50 text-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center">✎</div>
                </button>
              ))}
              {filteredManageAgents.length === 0 && (
                <div className="py-20 text-center opacity-30">
                  <p className="text-4xl mb-4">🏜️</p>
                  <p className="font-black uppercase text-[10px] tracking-widest">No Agent Found</p>
                </div>
              )}
           </div>
        </div>
      )}

      {/* EDIT AGENT DETAILS MODAL */}
      {editAgent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xl z-[1300] flex items-center justify-center px-6 animate-in zoom-in-95 duration-200">
          <div className="bg-white w-full max-w-sm rounded-[48px] p-10 shadow-2xl border border-slate-100 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>
             <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tighter uppercase text-center">এজেন্ট সংশোধন</h2>
             <div className="space-y-6 mb-10">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">এজেন্ট নাম</label>
                   <input 
                    type="text" 
                    value={editAgent.name} 
                    onChange={(e) => setEditAgent({...editAgent, name: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 font-black text-slate-900 outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                   />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">মোবাইল নাম্বার</label>
                   <input 
                    type="tel" 
                    value={editAgent.mobile} 
                    onChange={(e) => setEditAgent({...editAgent, mobile: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 font-black text-slate-900 outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                   />
                </div>
             </div>
             <div className="flex flex-col gap-3">
               <button onClick={handleAgentSave} className="w-full bg-indigo-600 text-white py-6 rounded-[32px] font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all">আপডেট করুন</button>
               <button onClick={() => setEditAgent(null)} className="w-full py-2 text-slate-300 font-black uppercase text-[10px] tracking-widest">বাতিল</button>
             </div>
          </div>
        </div>
      )}

      {/* NAME EDIT MODAL */}
      {showNameEdit && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xl z-[1100] flex items-center justify-center px-6 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[48px] p-10 shadow-2xl border border-slate-100 relative overflow-hidden">
              <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tighter uppercase text-center">নাম আপডেট করুন</h2>
              <div className="space-y-6 mb-10">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">DSO নাম</label>
                    <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 font-black text-slate-900 outline-none focus:ring-4 focus:ring-rose-50 transition-all"/>
                 </div>
              </div>
              <div className="flex flex-col gap-3">
                <button type="button" onClick={handleNameUpdate} className="w-full bg-[#E2136E] text-white py-6 rounded-[32px] font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all">সংরক্ষণ করুন</button>
                <button onClick={() => setShowNameEdit(false)} className="w-full py-4 text-slate-300 font-black uppercase text-[10px] tracking-widest text-center">বাতিল</button>
              </div>
           </div>
        </div>
      )}

      {/* PIN VERIFICATION MODAL */}
      {showPinModal && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-[1500] flex items-center justify-center px-8 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[48px] p-10 shadow-2xl border border-slate-100 text-center relative overflow-hidden">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">🔑</div>
              <h2 className="text-xl font-black text-slate-900 mb-2 tracking-tight uppercase">Security Pin Check</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">এগিয়ে যেতে আপনার সিকিউরিটি পিন দিন</p>
              <input 
                autoFocus 
                type="password" 
                placeholder="Enter App Pin" 
                value={verifyPinInput} 
                onChange={(e) => setVerifyPinInput(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handlePinVerify()} 
                className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 font-black text-slate-900 outline-none focus:ring-4 focus:ring-rose-50 transition-all text-center text-xl mb-6"
              />
              <button onClick={handlePinVerify} className="w-full bg-[#E2136E] text-white py-5 rounded-[28px] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all mb-4">Verify Identity</button>
              <button onClick={() => { setShowPinModal(false); setVerificationAction(null); }} className="w-full py-2 text-slate-300 font-black uppercase text-[10px] tracking-widest">Cancel</button>
           </div>
        </div>
      )}

      {/* PASSWORD CHANGE MODAL */}
      {showPassChange && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xl z-[1100] flex items-center justify-center px-6 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[48px] p-10 shadow-2xl border border-slate-100 relative overflow-hidden">
              <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tighter uppercase text-center">পিন রিসেট</h2>
              <div className="space-y-4 mb-10">
                 <input type="password" placeholder="পুরাতন পিন" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black outline-none focus:ring-2 focus:ring-rose-500"/>
                 <input type="password" placeholder="নতুন পিন" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black outline-none focus:ring-2 focus:ring-rose-500"/>
                 <input type="password" placeholder="পিন নিশ্চিত করুন" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black outline-none focus:ring-2 focus:ring-rose-500"/>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={handlePassUpdate} className="w-full bg-[#E2136E] text-white py-5 rounded-[28px] font-black uppercase text-xs tracking-widest active:scale-95 transition-all">পিন আপডেট করুন</button>
                <button onClick={() => setShowPassChange(false)} className="w-full py-2 text-slate-300 font-black text-[10px] uppercase">বাতিল</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const AdminActionCard = ({ title, desc, icon, color, onClick }: any) => (
  <button onClick={onClick} className={`w-full bg-white p-7 rounded-[36px] border-2 ${color || 'border-slate-100'} flex justify-between items-center active:scale-[0.98] transition-all text-left shadow-sm group`}>
    <div className="flex items-center gap-6">
      <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-3xl flex items-center justify-center text-2xl border border-slate-100 group-hover:scale-110 transition-transform">{icon}</div>
      <div><h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{title}</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{desc}</p></div>
    </div><span className="text-slate-200 text-xl">▶️</span>
  </button>
);

export default ProfileScreen;
