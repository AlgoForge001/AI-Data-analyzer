import React, { useRef } from "react";
import { Upload, FileText, X, ArrowUpRight } from "lucide-react";

const FileInput = ({ file, setFile }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) setFile(uploadedFile);
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="glass-card border-dashed hover:border-anthropic-border-warm hover:shadow-ring-warm p-8 flex flex-col items-center justify-center min-h-[220px] group transition-all">
      {file ? (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 ">
            <FileText size={32} />
          </div>
          <div className="text-center overflow-hidden w-full px-4">
            <p className="text-body-std font-medium text-anthropic-near-black truncate max-w-xs mx-auto">
              {file.name}
            </p>
            <p className="text-overline text-anthropic-stone-gray mt-1">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            onClick={clearFile}
            className="flex items-center gap-2 mt-2 px-5 py-2 text-anthropic-error hover:bg-anthropic-error/10 rounded-xl transition-all font-medium text-body-sm"
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
          <div className="p-5 bg-anthropic-warm-sand/50 text-anthropic-terracotta rounded-2xl mb-4 border border-anthropic-border-warm shadow-ring-warm group-hover:scale-110 transition-transform">
            <Upload size={32} />
          </div>
          <h3 className="text-feature text-anthropic-near-black mb-1">
            Upload Dataset
          </h3>
          <p className="text-anthropic-stone-gray text-center mb-6 max-w-xs text-body-sm">
            Drag & drop or browse your CSV, Excel, or JSON files
          </p>
          <button
            onClick={() => fileInputRef.current.click()}
            className="btn-terracotta px-8 py-3 rounded-xl font-medium flex items-center gap-2"
          >
            Browse Files
            <ArrowUpRight size={18} />
          </button>
          <div className="mt-8 flex items-center gap-3">
            {["CSV", "Excel", "JSON"].map((format) => (
              <span
                key={format}
                className="px-3 py-1 bg-anthropic-warm-sand/30 border border-anthropic-border-cream rounded-full text-label font-medium text-anthropic-stone-gray uppercase tracking-wider"
              >
                {format}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileInput;
