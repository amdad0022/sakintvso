
import React, { useState, useEffect } from 'react';

interface LoginScreenProps {
  onLogin: (mobile: string, pass: string) => void;
  loginError?: string | null;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, loginError }) => {
  const [mobile, setMobile] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLoginSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!mobile.trim() || !pass.trim()) return;
    onLogin(mobile.trim(), pass.trim());
  };

  return (
    <div className="min-h-full w-full bg-white flex flex-col items-center justify-center px-8 font-sans">
      <div className={`w-full max-w-[340px] transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        
        {/* --- BRANDING SECTION --- */}
        <div className="mb-14 text-center">
          <div className="w-16 h-16 bg-[#E2136E] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <span className="text-white text-3xl font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sakin <span className="text-[#E2136E]">Tvs</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-1.5">
            Nagad Distributor House
          </p>
        </div>

        {/* --- SIMPLE FORM SECTION --- */}
        <form onSubmit={handleLoginSubmit} className="w-full space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Mobile Number</label>
            <input 
              type="tel" 
              placeholder="01XXXXXXXXX"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className={`w-full bg-white border ${loginError ? 'border-red-500' : 'border-slate-200'} rounded-2xl px-6 py-5 outline-none font-semibold text-slate-800 focus:border-[#E2136E] transition-all text-lg`}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
              <button 
                type="button" 
                onClick={() => setShowPass(!showPass)}
                className="text-[9px] font-bold text-slate-400 hover:text-[#E2136E] uppercase"
              >
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
            <input 
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className={`w-full bg-white border ${loginError ? 'border-red-500' : 'border-slate-200'} rounded-2xl px-6 py-5 outline-none font-semibold text-slate-800 focus:border-[#E2136E] transition-all text-lg`}
            />
          </div>

          {/* ERROR MESSAGE DISPLAY */}
          {loginError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-[11px] font-black uppercase tracking-widest text-center animate-bounce">
               ⚠️ Wrong password & number
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-[#E2136E] text-white font-bold py-8 rounded-[24px] shadow-lg shadow-rose-100 active:scale-[0.98] transition-all text-sm uppercase tracking-[0.2em] mt-4"
          >
            Login Securely
          </button>
        </form>

        <div className="mt-20 text-center">
           <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
             Sakin TVS Enterprise Console • v5.0
           </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
