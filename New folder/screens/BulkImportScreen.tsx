
import React, { useState, useRef } from 'react';
import { Agent } from '../types';

interface BulkImportScreenProps {
  existingAgents: Agent[];
  onImport: (newAgents: Agent[]) => void;
  onBack: () => void;
}

interface CsvRow {
  dso_number: string;
  agent_number: string;
  shop_name: string;
}

const BulkImportScreen: React.FC<BulkImportScreenProps> = ({ existingAgents, onImport, onBack }) => {
  const [parsedData, setParsedData] = useState<CsvRow[]>([]);
  const [duplicates, setDuplicates] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setParsedData([]);
    setDuplicates([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(line => line !== '');
        
        if (lines.length < 2) {
          throw new Error("CSV file is empty or missing data.");
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const dsoIdx = headers.indexOf('dso_number');
        const agentIdx = headers.indexOf('agent_number');
        const shopIdx = headers.indexOf('shop_name');

        if (dsoIdx === -1 || agentIdx === -1 || shopIdx === -1) {
          throw new Error("Required columns missing. Expected: dso_number, agent_number, shop_name");
        }

        const rows: CsvRow[] = [];
        const foundDuplicates: string[] = [];
        const existingNumbers = new Set(existingAgents.map(a => a.mobile));

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          if (cols.length < 3) continue;

          const row: CsvRow = {
            dso_number: cols[dsoIdx],
            agent_number: cols[agentIdx],
            shop_name: cols[shopIdx]
          };

          if (!row.agent_number || row.agent_number.length < 5) continue;

          if (existingNumbers.has(row.agent_number)) {
            foundDuplicates.push(row.agent_number);
          } else {
            rows.push(row);
          }
        }

        if (rows.length === 0 && foundDuplicates.length === 0) {
          throw new Error("No valid data found in CSV rows.");
        }

        setParsedData(rows);
        setDuplicates(foundDuplicates);
      } catch (err: any) {
        setError(err.message || "Failed to parse CSV file.");
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    const newAgents: Agent[] = parsedData.map(row => ({
      id: Math.random().toString(36).substr(2, 9),
      name: row.shop_name,
      mobile: row.agent_number,
      area: "Distribution Area",
      currentDue: 0,
      assignedDsoMobile: row.dso_number,
      createdAt: new Date().toISOString(),
      status: 'active'
    }));

    onImport(newAgents);
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <header className="p-8 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="w-12 h-12 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl text-slate-400">
            ←
          </button>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Point Import</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
        <div className="bg-emerald-50 rounded-[40px] p-8 border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">🗄️</div>
             <h3 className="text-emerald-700 font-black text-xs uppercase tracking-[0.2em]">Global Sync Active</h3>
          </div>
          <p className="text-emerald-900/60 text-[11px] leading-relaxed font-bold uppercase tracking-tight">
            These points will be permanently linked to <span className="text-emerald-700">DSO numbers</span>. 
            Officers logging in will see their assigned shops automatically.
          </p>
        </div>

        {/* UPLOAD AREA with Pink Border */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="bg-white border-4 border-dashed border-[#E2136E] rounded-[48px] p-16 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-rose-50/30 transition-all active:scale-[0.98] group"
        >
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload}
          />
          <div className="w-24 h-24 bg-rose-50 rounded-[32px] flex items-center justify-center text-5xl mb-6 border border-rose-100 group-hover:bg-white transition-colors">📊</div>
          <p className="text-[#E2136E] font-black text-lg">Load Agent CSV</p>
          <p className="text-slate-400 text-[9px] uppercase font-black tracking-[0.4em] mt-3">Select the file with your 300+ points</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-500 p-6 rounded-[32px] border border-rose-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
             <span className="text-2xl">⚠️</span> {error}
          </div>
        )}

        {/* PREVIEW TABLE with Pink Background */}
        {parsedData.length > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Ready to Merge ({parsedData.length})</h3>
              {duplicates.length > 0 && (
                <span className="text-[8px] font-black text-amber-500 uppercase bg-amber-50 px-4 py-1.5 rounded-full tracking-widest border border-amber-100">
                  {duplicates.length} Existing Skipped
                </span>
              )}
            </div>
            
            <div className="rounded-[40px] border border-rose-100 overflow-hidden shadow-sm divide-y divide-rose-100">
              {parsedData.slice(0, 8).map((row, i) => (
                <div key={i} className="p-6 flex justify-between items-center bg-rose-50">
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900 leading-tight">{row.shop_name}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {row.agent_number}
                      </p>
                      <span className="w-1 h-1 bg-rose-200 rounded-full"></span>
                      <p className="text-[9px] font-black text-[#E2136E] uppercase tracking-widest">
                        DSO: {row.dso_number}
                      </p>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-white text-emerald-500 rounded-xl flex items-center justify-center text-xs shadow-sm">✓</div>
                </div>
              ))}
              {parsedData.length > 8 && (
                <div className="p-6 bg-rose-100/30 text-center">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
                    ... AND {parsedData.length - 8} OTHER POINTS LOADED
                  </span>
                </div>
              )}
            </div>

            <button 
              onClick={confirmImport}
              className="w-full ruby-gradient text-white font-black py-6 rounded-[32px] shadow-2xl shadow-rose-100 active:scale-95 transition-all text-[11px] uppercase tracking-[0.3em]"
            >
              Merge into Global Registry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BulkImportScreen;
