import React, { useRef, useEffect } from "react";
import { Paperclip, Zap, Loader2, X, FileText } from "lucide-react";

const BottomInputBar = ({ 
  file, 
  setFile, 
  prompt, 
  setPrompt, 
  onExecute, 
  loading,
  isUploading,
  onCancel,
  isCancelling,
  placeholder = "Describe what you want to analyse..."
}) => {
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [prompt]);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) setFile(uploadedFile);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!loading && file && prompt.trim()) {
        onExecute();
      }
    }
  };

  const isExecuteDisabled = !file || !prompt.trim() || loading;

  return (
    <div className="w-full max-w-[860px] mx-auto sticky bottom-6 z-30 px-4 animate-fade-in-up">
      <div className="bg-white border border-anthropic-border-cream rounded-2xl shadow-elegant p-2 flex flex-col sm:flex-row sm:items-end gap-2 transition-all focus-within:shadow-ring-warm focus-within:border-anthropic-border-warm">
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept=".csv,.xlsx,.json"
        />

        {/* Upload Button or File Chip */}
        <div className="flex items-center w-full sm:w-auto shrink-0">
          {file ? (
            <div className="flex items-center justify-between w-full sm:w-auto gap-2 bg-anthropic-warm-sand/50 border border-anthropic-border-cream px-3 py-2 rounded-xl text-anthropic-near-black animate-fade-in">
              <div className="flex items-center gap-2 overflow-hidden">
                {loading ? (
                  <Loader2 size={16} className="text-anthropic-terracotta animate-spin shrink-0" />
                ) : (
                  <FileText size={16} className="text-anthropic-terracotta shrink-0" />
                )}
                <span className="text-[12px] font-medium truncate max-w-[200px]">{file.name}</span>
              </div>
              <button 
                onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                disabled={loading}
                className="hover:bg-anthropic-warm-sand p-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ml-2"
              >
                <X size={14} className="text-anthropic-stone-gray hover:text-anthropic-error" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => fileInputRef.current.click()}
              disabled={loading}
              title="Upload Dataset"
              className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto px-4 py-2 bg-anthropic-warm-sand/30 hover:bg-anthropic-warm-sand border border-dashed border-anthropic-stone-gray/50 hover:border-anthropic-terracotta/50 text-anthropic-stone-gray hover:text-anthropic-terracotta rounded-xl transition-all disabled:opacity-50 group shrink-0"
            >
              <Paperclip size={16} className="group-hover:scale-110 transition-transform" />
              <span className="text-[13px] sm:text-[12px] font-medium whitespace-nowrap">Upload Data</span>
            </button>
          )}
        </div>

        {/* Textarea and Actions Wrapper for Mobile Row Layout */}
        <div className="flex flex-row w-full sm:w-auto flex-1 items-end gap-2 bg-anthropic-warm-sand/20 sm:bg-transparent p-1 sm:p-0 rounded-xl sm:rounded-none">
          
          {/* Prompt Textarea */}
          <div className="flex-1 min-h-[40px] flex items-center px-2 sm:px-1">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full bg-transparent border-none focus:ring-0 text-[14px] sm:text-body-sm py-2 resize-none max-h-[120px] scrollbar-hide text-anthropic-near-black placeholder:text-anthropic-stone-gray"
              rows={1}
            />
          </div>

          {/* Execute or Cancel Button */}
          <div className="shrink-0 pb-0.5 sm:pb-0 pr-0.5 sm:pr-0">
            {loading ? (
              <button
                onClick={isUploading ? undefined : onCancel}
                disabled={isCancelling || isUploading}
                title="Cancel"
                className={`
                  flex items-center justify-center gap-2 p-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-[14px] sm:text-body-sm transition-all h-[36px] w-[36px] sm:h-auto sm:w-auto
                  ${(isCancelling || isUploading)
                    ? 'bg-anthropic-warm-sand/50 text-anthropic-stone-gray cursor-not-allowed' 
                    : 'bg-anthropic-error text-white hover:bg-anthropic-error/90 active:scale-95 shadow-whisper'
                  }
                `}
              >
                {isUploading || (!isCancelling && loading) ? (
                  <Loader2 size={16} className="animate-spin shrink-0" />
                ) : isCancelling ? (
                  <Loader2 size={16} className="animate-spin shrink-0" />
                ) : (
                  <X size={16} className="shrink-0" />
                )}
                <span className="hidden sm:inline whitespace-nowrap">
                  {isUploading ? 'Uploading...' : isCancelling ? 'Cancelling...' : 'Processing...'}
                </span>
              </button>
            ) : (
              <button
                onClick={onExecute}
                disabled={isExecuteDisabled}
                title="Execute"
                className={`
                  flex items-center justify-center gap-2 p-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-[14px] sm:text-body-sm transition-all h-[36px] w-[36px] sm:h-auto sm:w-auto
                  ${isExecuteDisabled 
                    ? 'bg-anthropic-warm-sand/50 text-anthropic-stone-gray cursor-not-allowed' 
                    : 'bg-anthropic-terracotta text-white hover:bg-anthropic-terracotta/90 active:scale-95 shadow-whisper'
                  }
                `}
              >
                <Zap size={16} fill="currentColor" className="shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Execute</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Short Hint */}
      {!isExecuteDisabled && !loading && (
        <p className="text-[10px] text-anthropic-stone-gray text-center mt-2 animate-fade-in">
          Press <span className="font-bold">Ctrl + Enter</span> to execute analysis
        </p>
      )}
    </div>
  );
};

export default BottomInputBar;
