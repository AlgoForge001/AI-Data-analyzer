import React, { useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';

const FileInput = ({ file, setFile }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) setFile(uploadedFile);
    };

    const clearFile = () => {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="glass-card border-dashed hover:border-[#00C6FF]/40 hover:shadow-[0_0_20px_rgba(0,198,255,0.15)] p-8 flex flex-col items-center justify-center min-h-[220px] group transition-all">
            {file ? (
                <div className="flex flex-col items-center gap-4 w-full">
                    <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                        <FileText size={32} />
                    </div>
                    <div className="text-center overflow-hidden w-full">
                        <p className="font-semibold text-white truncate max-w-xs mx-auto">{file.name}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                        onClick={clearFile}
                        className="flex items-center gap-2 mt-2 px-4 py-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-medium text-sm"
                    >
                        <X size={16} />
                        Remove Dataset
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center w-full">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".csv,.xlsx,.json"
                    />
                    <div className="p-5 bg-[#00C6FF]/10 text-[#00C6FF] rounded-2xl mb-4 border border-[#00C6FF]/20 shadow-[0_0_20px_rgba(0,198,255,0.3)] group-hover:scale-110 transition-transform">
                        <Upload size={32} className="drop-shadow-[0_0_8px_rgba(0,198,255,0.8)]" />
                    </div>
                    <p className="text-slate-400 text-center mb-6 max-w-xs font-medium">
                        Drag & drop your dataset here
                    </p>
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="btn-gradient px-8 py-3 rounded-xl font-bold shadow-xl flex items-center gap-2"
                    >
                        Browse File
                    </button>
                    <div className="mt-8 flex items-center gap-3">
                        <span className="px-3 py-1 bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-full text-[10px] font-bold text-slate-400 tracking-wider uppercase shadow-inner">CSV</span>
                        <span className="px-3 py-1 bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-full text-[10px] font-bold text-slate-400 tracking-wider uppercase shadow-inner">Excel</span>
                        <span className="px-3 py-1 bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-full text-[10px] font-bold text-slate-400 tracking-wider uppercase shadow-inner">JSON</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileInput;
