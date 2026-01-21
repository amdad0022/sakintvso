
import React, { useState, useRef } from 'react';
import { UserRole } from '../types';

interface BulkDsoImportScreenProps {
  onImport: (dsos: { mobile: string, name: string }[]) => void;
  onBack: () => void;
}

interface DsoCsvRow {
  dso_number: string;
  dso_name: string;
  role: string;
}

const BulkDsoImportScreen: React.FC<BulkDsoImportScreenProps> = ({ onImport, onBack }) => {
  const [parsedData, setParsedData] = useState<DsoCsvRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setParsedData([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(line => line !== '');
        
        if (lines.length < 2) {
          throw new Error("CSV file is empty or missing data.");
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const numIdx = headers.indexOf('dso_number');
        const nameIdx = headers.indexOf('dso_name');
        const roleIdx = headers.indexOf('role');

        if (numIdx === -1 || nameIdx === -1) {
          throw new Error("Required columns missing: dso_number, dso_name");
        }

        const rows: DsoCsvRow[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          if (cols.length < 2) continue;

          rows.push({
            dso_number: cols[numIdx],
            dso_name: cols[nameIdx],
            role: roleIdx > -1 ? cols[roleIdx] : 'DSO'
          });
        }

        setParsedData(rows);
      } catch (err: any) {
        setError(err.message || "Failed to parse CSV file.");
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    const dsoPayload = parsedData.map(row => ({
      mobile: row.dso_number,
      name: row.dso_name
    }));
    onImport(dsoPayload);
  };

  return (
    <div className="flex flex-col h-full bg-[#FBFCFE] overflow-hidden">
      <header className="p-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-500">
            ←
          </button>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">Officer Registry</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        <div className="bg-emerald-50 rounded-[32px] p-6 border border-emerald-100">
          <h3 className="text-emerald-900 font-black text-[10px] uppercase tracking-widest mb-3">Permanent Database Update</h3>
          <p className="text-emerald-700/70 text-[11px] leading-relaxed font-medium uppercase tracking-tight">
            Imported officers are stored in the <span className="text-emerald-800">Global Ledger</span>. 
            New officers are assigned the default password: <span className="bg-white px-2 rounded">112233</span>.
          </p>
        </div>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-4 border-dashed border-emerald-100 rounded-[40px] p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-emerald-50 transition-colors"
        >
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload}
          />
          <span className="text-5xl mb-4">👤</span>
          <p className="text-slate-900 font-black text-base">Select Officer CSV</p>
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-2">Click to load dso_registry.csv</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-6 rounded-[32px] border border-rose-100 text-[10px] font-black uppercase tracking-widest">
             ⚠️ {error}
          </div>
        )}

        {parsedData.length > 0 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Preview ({parsedData.length} entries)</h3>
            <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm divide-y divide-slate-50">
              {parsedData.map((row, i) => (
                <div key={i} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-black text-slate-800">{row.dso_name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {row.dso_number} • {row.role}
                    </p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black px-2 py-1 rounded-full uppercase">Ready</span>
                </div>
              ))}
            </div>

            <button 
              onClick={confirmImport}
              className="w-full bg-slate-900 text-white font-black py-5 rounded-[28px] shadow-2xl active:scale-95 transition-all text-[11px] uppercase tracking-widest"
            >
              Save to Global Ledger
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkDsoImportScreen;
