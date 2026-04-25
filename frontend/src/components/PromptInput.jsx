import React from "react";
import { MessageSquare, Sparkles } from "lucide-react";

const PromptInput = ({ prompt, setPrompt }) => {
  return (
    <div className="glass-card p-8 flex flex-col items-start min-h-[220px]">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-anthropic-focus/10 text-anthropic-focus rounded-xl border border-anthropic-focus/20">
          <MessageSquare size={20} />
        </div>
        <h3 className="text-feature text-anthropic-near-black">
          Analysis Prompt
        </h3>
      </div>

      <p className="text-body-sm text-anthropic-stone-gray mb-4">
        What would you like to discover in this dataset? Be as specific as
        possible.
      </p>

      <div className="relative w-full flex-1 flex flex-col">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Identify the top 5 performing regions by revenue growth and visualize the trend over the last 6 months...'"
          className="anthropic-input w-full flex-1 min-h-[120px] resize-none pt-3 pb-10"
        />
        <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-label font-medium text-anthropic-stone-gray">
          <Sparkles size={14} className="text-anthropic-focus" />
          <span>AI will generate insights and visualizations</span>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
