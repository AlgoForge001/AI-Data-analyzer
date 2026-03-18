import React from 'react';
import { Sparkles } from 'lucide-react';

const PromptInput = ({ prompt, setPrompt }) => {
    return (
        <div className="glass-card hover:border-[#7B2FF7]/40 hover:shadow-[0_0_20px_rgba(123,47,247,0.15)] p-8 flex flex-col gap-4 min-h-[220px] transition-all relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7B2FF7]/5 to-transparent rounded-2xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
            <div className="flex items-center gap-2 mb-2 relative z-10">
                <Sparkles size={18} className="text-[#F107A3] drop-shadow-[0_0_8px_rgba(241,7,163,0.6)]" />
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    Enter Analysis Prompt
                </label>
            </div>

            <div className="flex-1 relative z-10">
                <textarea
                    className="w-full h-full p-5 bg-[rgba(255,255,255,0.02)] border border-white/10 rounded-2xl outline-none resize-none text-white placeholder:text-slate-500 text-base focus:border-[#7B2FF7]/50 focus:shadow-[0_0_20px_rgba(123,47,247,0.2)] transition-all shadow-inner leading-relaxed"
                    placeholder="e.g., 'Create a sales trend graph' or 'Show top 5 products'..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                ></textarea>
            </div>

            <p className="text-[11px] text-slate-500 italic px-2">
                Describe what insights or visualizations you want from the dataset.
            </p>
        </div>
    );
};

export default PromptInput;
