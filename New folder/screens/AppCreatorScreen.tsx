
import React from 'react';

interface AppCreatorScreenProps {
  onBack: () => void;
}

const AppCreatorScreen: React.FC<AppCreatorScreenProps> = ({ onBack }) => {
  // Official Creator Image from Cloudinary
  const creatorImageUrl = "https://res.cloudinary.com/dz46f4cqz/image/upload/creator_hiseym.jpg";

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden font-sans animate-in fade-in duration-500">
      {/* PREMIUM PINK HEADER */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-[#E2136E] flex items-center px-6 z-[100] shadow-xl">
        <button 
          onClick={onBack} 
          className="w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-2xl text-white active:scale-90 transition-all border border-white/30"
        >
          <span className="text-2xl leading-none">←</span>
        </button>
        <div className="flex-1 flex justify-center mr-12">
          <h1 className="text-[13px] font-black text-white uppercase tracking-[0.4em] leading-none">App Creator</h1>
        </div>
      </header>

      {/* SCROLLABLE PROFILE CONTENT */}
      <div className="flex-1 overflow-y-auto pt-20 custom-scrollbar">
        
        {/* HERO SECTION WITH LUXURY LIGHT ENERGY BURST */}
        <section className="relative pt-24 pb-16 flex flex-col items-center bg-gradient-to-b from-amber-50/40 via-white to-white overflow-hidden">
          
          {/* 1. LAYERED AMBIENT HALO (Deep Background) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-radial from-amber-200/10 via-amber-50/5 to-transparent blur-[140px] pointer-events-none"></div>

          {/* Profile Photo Container with High-Intensity Energy Effect */}
          <div className="relative mb-16 z-10">
            
            {/* 2. CORE RADIANCE HALO (Immediately behind photo) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-gradient-radial from-amber-300/25 via-amber-200/10 to-transparent blur-3xl pointer-events-none"></div>
            
            {/* 3. LIGHT ENERGY RAYS (Subtle Cinematic Streaks) */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] opacity-[0.08] pointer-events-none blur-[1px]"
              style={{
                background: 'conic-gradient(from 15deg, transparent 0deg, #B45309 5deg, transparent 15deg, transparent 40deg, #D97706 48deg, transparent 60deg, transparent 110deg, #F59E0B 120deg, transparent 140deg, transparent 190deg, #B45309 205deg, transparent 220deg, transparent 275deg, #FBBF24 285deg, transparent 310deg)'
              }}
            ></div>

            {/* 4. SCATTERED ENERGY PARTICLES (Light Dots, Not Emojis) */}
            {/* These are small, high-glow points of "energy" */}
            <div className="absolute top-[-20%] left-[-15%] w-1.5 h-1.5 bg-amber-400 rounded-full blur-[0.5px] shadow-[0_0_12px_4px_rgba(251,191,36,0.6)] opacity-60"></div>
            <div className="absolute top-[-35%] right-[-10%] w-2 h-2 bg-amber-300 rounded-full blur-[1px] shadow-[0_0_15px_5px_rgba(252,211,77,0.5)] opacity-50"></div>
            <div className="absolute bottom-[0%] right-[-25%] w-1 h-1 bg-amber-500 rounded-full blur-[0.5px] shadow-[0_0_10px_3px_rgba(245,158,11,0.7)] opacity-40"></div>
            <div className="absolute bottom-[-15%] left-[5%] w-2.5 h-2.5 bg-amber-200 rounded-full blur-[2px] shadow-[0_0_20px_8px_rgba(254,243,199,0.4)] opacity-30"></div>
            <div className="absolute top-[40%] right-[-30%] w-1 h-1 bg-amber-400 rounded-full shadow-[0_0_8px_2px_rgba(251,191,36,0.5)] opacity-50"></div>

            {/* 5. SOFT OUTER GLOW RING */}
            <div className="absolute -inset-10 bg-gradient-to-tr from-amber-400/5 via-transparent to-amber-200/5 rounded-full blur-[60px]"></div>
            
            {/* The Main Profile Circle (Enterprise Level Precision) */}
            <div className="w-60 h-60 rounded-full border-[10px] border-white shadow-[0_45px_90px_-25px_rgba(184,134,11,0.4)] overflow-hidden relative z-10 bg-slate-100 ring-2 ring-amber-100/50">
              <img 
                src={creatorImageUrl} 
                alt="Moin Uddin Mahin" 
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Moin+Uddin+Mahin&background=E2136E&color=fff&size=512";
                }}
              />
            </div>
          </div>

          <div className="text-center z-10 space-y-4 px-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-tight drop-shadow-sm">
              Moin Uddin Mahin
            </h2>
            
            {/* Identity Badge with Glassmorphism shadow */}
            <div className="inline-flex items-center px-12 py-3 rounded-full border-2 border-amber-400/30 bg-white shadow-[0_12px_25px_-8px_rgba(184,134,11,0.2)]">
              <span className="text-amber-700 text-[10px] font-black uppercase tracking-[0.6em]">System Administrator</span>
            </div>
          </div>
        </section>

        {/* INFORMATION CARDS */}
        <div className="px-8 pb-24 space-y-10">
          
          {/* DESIGNATION CARD */}
          <div className="bg-white rounded-[56px] p-12 border border-slate-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.03)] space-y-10 animate-in slide-in-from-bottom-6 duration-700">
            <div className="flex flex-col gap-3">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.6em]">Designation</span>
              <div className="space-y-1.5">
                <p className="text-xl font-extrabold text-slate-800 leading-tight">Admin at Sakin Tvs</p>
                <p className="text-[13px] font-bold text-[#E2136E] uppercase tracking-[0.2em]">Nagad Distributor House</p>
              </div>
            </div>
          </div>

          {/* ABOUT SECTION */}
          <section className="space-y-8 px-2 animate-in slide-in-from-bottom-8 duration-900">
            <div className="flex items-center gap-6">
              <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.6em] whitespace-nowrap">Technical Profile</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-amber-200 to-transparent"></div>
            </div>
            
            <div className="bg-slate-50/50 rounded-[56px] p-12 border border-white shadow-inner backdrop-blur-sm">
              <p className="text-[15px] font-medium text-slate-600 leading-[1.9] text-justify tracking-tight italic">
                "Moin Uddin Mahin is the administrative and technical architect behind the system, responsible for overseeing distributor operations, monitoring DSO performance, and generating KPI-driven reports. With a strong focus on accuracy, accountability, and system integrity, he ensures smooth financial tracking and operational transparency across the entire distribution network."
              </p>
            </div>
          </section>

          {/* OFFICIAL FOOTER */}
          <div className="pt-16 text-center opacity-30">
            <p className="text-[9px] font-black text-slate-900 uppercase tracking-[0.8em]">Enterprise Management Interface</p>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-3">© 2025 Sakin Tvs Ledger Elite • Security Level 4</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppCreatorScreen;
