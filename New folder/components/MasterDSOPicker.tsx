
import React, { useState, useMemo } from 'react';
import { User, UserRole } from '../types';

interface MasterDSOPickerProps {
  role: UserRole;
  currentDSO: User | null;
  onSelect: (u: User) => void;
  dsos: User[];
}

const MasterDSOPicker: React.FC<MasterDSOPickerProps> = ({ role, currentDSO, onSelect, dsos }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isMaster = role === UserRole.MASTER;

  const filteredDsos = useMemo(() => {
    if (!searchTerm.trim()) return dsos;
    const term = searchTerm.toLowerCase();
    return dsos.filter(dso => 
      dso.name.toLowerCase().includes(term) || 
      dso.mobile.includes(term)
    );
  }, [dsos, searchTerm]);

  const handleOpen = () => {
    setSearchTerm('');
    setIsOpen(true);
  };

  return (
    <div className={`sticky top-0 left-0 right-0 z-[100] ${isMaster ? 'bg-slate-900' : 'bg-[#E2136E]'} text-white px-6 py-2.5 flex justify-between items-center text-[10px] font-bold shadow-lg`}>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full animate-pulse ${isMaster ? 'bg-[#E2136E]' : 'bg-white'}`}></span>
        <span className="uppercase tracking-widest leading-none">
          {isMaster ? 'MASTER' : 'ADMIN'}: {currentDSO?.name || '...'}
        </span>
      </div>
      <button 
        onClick={handleOpen}
        className="bg-white/10 px-4 py-1.5 rounded-lg hover:bg-white/20 uppercase tracking-[0.2em] transition-all border border-white/10"
      >
        Switch DSO
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[101] p-6 flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl relative flex flex-col max-h-[80vh]">
            <h3 className="text-slate-400 uppercase tracking-widest text-[10px] mb-6 font-black text-center">Select Officer</h3>
            
            <div className="relative mb-6">
              <input 
                autoFocus
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-10 py-4 outline-none font-bold text-slate-800 focus:ring-4 focus:ring-pink-50 transition-all text-xs"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-20 text-sm">🔍</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredDsos.map(dso => (
                <button
                  key={dso.id}
                  onClick={() => {
                    onSelect(dso);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-4 rounded-[24px] flex justify-between items-center transition-all ${currentDSO?.id === dso.id ? 'bg-pink-50 border border-pink-100 text-[#E2136E]' : 'bg-slate-50 border border-transparent text-slate-600 active:scale-[0.98]'}`}
                >
                  <div className="flex flex-col">
                    <span className="font-black text-sm">{dso.name}</span>
                    <span className="text-[9px] opacity-70 tracking-widest uppercase font-bold mt-1">{dso.mobile}</span>
                  </div>
                </button>
              ))}
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="w-full mt-6 py-4 text-slate-400 uppercase tracking-widest text-[9px] font-black border-t border-slate-50 pt-6"
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDSOPicker;
