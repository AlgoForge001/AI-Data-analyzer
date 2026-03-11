import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2, PieChart, TrendingUp, Info, Code2, Copy, Check, FileJson, ImageIcon } from 'lucide-react';

const AnalysisOutput = ({ data, loading }) => {
    const [copied, setCopied] = React.useState(false);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 animate-pulse text-slate-500">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                    <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative">
                        <TrendingUp size={64} className="animate-bounce" />
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Analyzing your dataset...</h3>
                <p className="text-slate-400">Consulting AI for advanced insights</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                <div className="grid grid-cols-3 gap-8 opacity-10 mb-8">
                    <BarChart2 size={48} className="text-slate-300" />
                    <PieChart size={48} className="text-slate-300" />
                    <TrendingUp size={48} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-500 mb-2">Analysis Results Area</h3>
                <p className="text-slate-600 max-w-sm mb-6">
                    Upload a file and enter a prompt to see intelligent insights and visualizations here.
                </p>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-500 rounded-full text-xs font-bold uppercase tracking-widest border border-white/5">
                    <Info size={14} />
                    Standby for Input
                </div>
            </div>
        );
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Determine response type
    const hasCharts = data.charts && Array.isArray(data.charts) && data.charts.length > 0;
    const hasSingleImage = data.type === 'chart' && data.image && typeof data.image === 'string';
    const hasImages = data.type === 'chart' && data.images && data.images.length > 0;
    const hasText = data.type === 'text' && data.content;
    const hasCode = data.generated_code;
    const hasChartData = data.chart_data && Array.isArray(data.chart_data);

    return (
        <div className="h-full flex flex-col p-8 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                        {hasText ? <Info size={24} /> : hasCharts || hasSingleImage || hasImages ? <ImageIcon size={24} /> : <BarChart2 size={24} />}
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white">
                            {hasText ? 'Analysis Result' : hasCharts || hasSingleImage || hasImages ? 'Chart Visualization' : 'Insight Generation'}
                        </h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">AI Analysis Result</p>
                    </div>
                </div>

                {hasCode && (
                    <button
                        onClick={() => copyToClipboard(hasCode)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white text-sm font-medium border border-white/5"
                    >
                        {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        {copied ? 'Copied' : 'Copy Code'}
                    </button>
                )}
            </div>

            {/* ===== CASE 0: Charts array (data.charts with filename + image_base64) ===== */}
            {hasCharts && (
                <div className="flex flex-col gap-8 mb-8">
                    {data.charts.map((chart, index) => (
                        <div key={index} className="bg-[#1a2333]/40 rounded-3xl border border-white/5 p-4 overflow-hidden">
                            {chart.filename && (
                                <p className="text-sm text-slate-400 font-semibold mb-3 px-2">{chart.filename}</p>
                            )}
                            <img
                                src={`data:image/png;base64,${chart.image_base64}`}
                                alt={chart.filename || `Chart ${index + 1}`}
                                className="w-full rounded-2xl"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* ===== CASE 1A: Single Base64 Chart Image (data.image) ===== */}
            {!hasCharts && hasSingleImage && (
                <div className="flex flex-col gap-8 mb-8">
                    <div className="bg-[#1a2333]/40 rounded-3xl border border-white/5 p-4 overflow-hidden">
                        <img
                            src={`data:image/png;base64,${data.image}`}
                            alt="Chart"
                            className="w-full rounded-2xl"
                        />
                    </div>
                </div>
            )}

            {/* ===== CASE 1B: Multiple Base64 Chart Images (data.images array) ===== */}
            {!hasCharts && !hasSingleImage && hasImages && (
                <div className="flex flex-col gap-8 mb-8">
                    {data.images.map((img, index) => (
                        <div key={index} className="bg-[#1a2333]/40 rounded-3xl border border-white/5 p-4 overflow-hidden">
                            <img
                                src={`data:image/png;base64,${img}`}
                                alt={`Chart ${index + 1}`}
                                className="w-full rounded-2xl"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* ===== CASE 2: Text Response ===== */}
            {!hasCharts && hasText && (
                <div className="flex-1 bg-[#1a2333]/30 rounded-3xl border border-white/5 p-8">
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-base">
                        {data.content}
                    </p>
                </div>
            )}

            {/* ===== CASE 3: JSON Chart Data (Recharts) ===== */}
            {!hasCharts && !hasSingleImage && !hasImages && !hasText && hasChartData && (
                <div className="mb-10 w-full h-[400px] bg-[#1a2333]/30 rounded-3xl border border-white/5 p-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.chart_data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{
                                backgroundColor: '#1a2333',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px', color: '#fff'
                            }} />
                            <Bar dataKey="value" fill="url(#colorGradient)" radius={[6, 6, 0, 0]} />
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* ===== CASE 4: Generated Code (Fallback) ===== */}
            {!hasCharts && !hasSingleImage && !hasImages && !hasText && !hasChartData && hasCode && (
                <div className="flex-1 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Code2 size={18} />
                        <span className="text-sm font-bold uppercase tracking-wide">Generated Python Code</span>
                    </div>
                    <div className="flex-1 bg-[#05070a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative group">
                        <pre className="text-blue-400 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                            <code>{hasCode}</code>
                        </pre>
                        <div className="absolute top-4 right-4 text-xs text-slate-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            python
                        </div>
                    </div>
                    {data.execution_error && (
                        <div className="mt-2 p-3 bg-yellow-500/5 rounded-xl border border-yellow-500/10 flex items-start gap-3">
                            <Info size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-400">Execution note: {data.execution_error}</p>
                        </div>
                    )}
                    <div className="mt-4 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-start gap-3">
                        <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-400 leading-relaxed">
                            The AI has generated Python code. You can copy and run it in a Jupyter Notebook or Python environment.
                        </p>
                    </div>
                </div>
            )}

            {/* ===== CASE 5: Unknown Format ===== */}
            {!hasCharts && !hasSingleImage && !hasImages && !hasText && !hasChartData && !hasCode && (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                    <FileJson size={40} className="text-slate-700 mb-4" />
                    <p className="text-slate-500 font-medium">No visualization available for this response.</p>
                </div>
            )}
        </div>
    );
};

export default AnalysisOutput;
