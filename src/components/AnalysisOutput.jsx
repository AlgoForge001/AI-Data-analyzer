import React from 'react';
import { BarChart2, PieChart, TrendingUp, Info } from 'lucide-react';

const AnalysisOutput = () => {
    return (
        <div className="flex-1 mt-6 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-12 bg-white/50">
            <div className="grid grid-cols-3 gap-8 opacity-20 mb-8">
                <BarChart2 size={48} className="text-slate-300" />
                <PieChart size={48} className="text-slate-300" />
                <TrendingUp size={48} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-400 mb-2">Analysis Results Area</h3>
            <p className="text-slate-400 text-center max-w-sm mb-6">
                Upload a file and enter a prompt to see intelligent insights and visualizations here.
            </p>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-500 rounded-full text-sm font-medium">
                <Info size={16} />
                Insights will be generated in real-time
            </div>
        </div>
    );
};

export default AnalysisOutput;
