import React, { useState } from 'react';
import Plot from "react-plotly.js";
import { TrendingUp, Copy, Check, FileJson, Maximize2, X, BarChart2, Download } from 'lucide-react';

const AnalysisOutput = ({ data, loading }) => {
    const [copied, setCopied] = useState(false);
    const [fullscreenChart, setFullscreenChart] = useState(null);

    const hasCharts = data?.charts && Array.isArray(data.charts) && data.charts.length > 0;
    const hasText = data?.type === 'text' && data?.content;
    const hasCode = data?.generated_code;
    const hasTables = data?.tables && Array.isArray(data.tables) && data.tables.length > 0;

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadCSV = (tableData, filename = "table.csv") => {
        if (!tableData || tableData.length === 0) return;

        const headers = Object.keys(tableData[0]);

        const csvRows = [
            headers.join(","), // header row
            ...tableData.map(row =>
                headers.map(field => `"${row[field] ?? ""}"`).join(",")
            )
        ];

        const csvContent = csvRows.join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ===== LOADING =====
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-20 animate-pulse text-slate-500">
                <div className="mb-6">
                    <TrendingUp size={60} className="animate-bounce text-blue-500/50" />
                </div>
                <h3 className="text-xl text-white font-bold mb-2">Analyzing your dataset...</h3>
                <p className="text-slate-400">Generating interactive charts</p>
            </div>
        );
    }

    // ===== EMPTY =====
    if (!data) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-10">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700">
                    <BarChart2 size={32} className="text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-300 mb-2">No Analysis Yet</h3>
                <p className="text-slate-500 max-w-sm">
                    Upload your data file and enter a prompt to generate insights and charts
                </p>
            </div>
        );
    }

    return (
        <div className="h-full p-4 lg:p-6 overflow-y-auto flex flex-col bg-[#0f172a]/95">

            {/* ===== HEADER ===== */}
            <div className="flex justify-between items-center mb-4 lg:mb-6 shrink-0">
                <h2 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
                    <div className="p-1.5 lg:p-2 bg-blue-500/10 rounded-lg">
                        <BarChart2 className="text-blue-400" size={20} />
                    </div>
                    Analytics Dashboard
                </h2>

                {hasCode && (
                    <button
                        onClick={() => copyToClipboard(hasCode)}
                        className="flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm border border-slate-700 transition-all shadow-sm"
                    >
                        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-slate-400" />}
                        {copied ? <span className="text-green-400 font-medium">Copied</span> : <span className="text-slate-200">Copy Code</span>}
                    </button>
                )}
            </div>

            {/* ===== CHARTS ===== */}
            {hasCharts && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 shrink-0 mb-6">
                    {data.charts.map((chart, index) => {
                        const title = chart.layout?.title?.text || chart.layout?.title || `Dynamic Chart ${index + 1}`;
                        
                        // Optimize layout for grid cards to save space
                        const optimizedLayout = {
                            ...chart.layout,
                            title: null, 
                            autosize: true,
                            margin: { l: 40, r: 15, t: 15, b: 35 }, 
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent',
                            font: { color: '#94a3b8', size: 10 }
                        };

                        return (
                            <div
                                key={index}
                                className="group relative flex flex-col bg-[#1e293b]/90 hover:bg-[#1e293b] border border-slate-700/60 hover:border-blue-500/40 rounded-xl shadow-lg hover:shadow-blue-500/5 transition-all duration-300 overflow-hidden h-[280px] lg:h-[calc((100vh-220px)/2)] lg:min-h-[220px]" 
                            >
                                {/* Compact Card Header */}
                                <div className="flex justify-between items-center px-3 py-2 border-b border-slate-700/50 bg-slate-800/40 shrink-0">
                                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                                        <div className="p-1 bg-blue-500/10 rounded border border-blue-500/20">
                                            <TrendingUp size={12} className="text-blue-400" />
                                        </div>
                                        <h3 className="text-xs font-semibold text-slate-200 truncate" title={typeof title === 'string' ? title : ''}>
                                            {typeof title === 'string' ? title : `Chart ${index + 1}`}
                                        </h3>
                                    </div>
                                    <button 
                                        onClick={() => setFullscreenChart(chart)}
                                        className="text-slate-400 hover:text-white transition-colors p-1.5 lg:opacity-0 group-hover:opacity-100 rounded-md hover:bg-slate-700 shrink-0"
                                        title="View Fullscreen"
                                    >
                                        <Maximize2 size={14} />
                                    </button>
                                </div>
                                
                                {/* Chart Area */}
                                <div className="flex-1 w-full p-1 relative min-h-0 bg-gradient-to-b from-transparent to-slate-900/20">
                                    <Plot
                                        data={chart.data}
                                        layout={optimizedLayout}
                                        config={{
                                            responsive: true,
                                            displayModeBar: false
                                        }}
                                        style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
                                        useResizeHandler={true}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ===== TABLES ===== */}
            {hasTables && (
                <div className="space-y-4 shrink-0 mb-6">
                    {data.tables.map((table, index) => (
                        <div
                            key={index}
                            className="bg-[#1e293b]/90 rounded-xl border border-slate-700/60 shadow-lg overflow-hidden flex flex-col max-h-[400px]"
                        >
                            <div className="flex justify-between items-center px-4 py-3 border-b border-slate-700/50 bg-slate-800/40 shrink-0">
                                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <FileJson size={14} className="text-blue-400" />
                                    {table.title || "Data Table"}
                                </h3>
                                <button 
                                    onClick={() => downloadCSV(table.data, `${table.title || "table"}.csv`)}
                                    className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg transition-colors"
                                >
                                    <Download size={12} />
                                    Export CSV
                                </button>
                            </div>

                            <div className="overflow-auto flex-1 p-0">
                                <table className="min-w-full text-sm text-left">
                                    <thead className="sticky top-0 bg-slate-800/90 backdrop-blur shadow-sm z-10">
                                        <tr>
                                            {Object.keys(table.data[0] || {}).map((col, i) => (
                                                <th
                                                    key={i}
                                                    className="px-4 py-2.5 border-b border-slate-700 font-medium text-slate-300 whitespace-nowrap"
                                                >
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-700/50">
                                        {table.data.map((row, rIdx) => (
                                            <tr
                                                key={rIdx}
                                                className="hover:bg-slate-800/50 transition-colors"
                                            >
                                                {Object.values(row).map((val, cIdx) => (
                                                    <td
                                                        key={cIdx}
                                                        className="px-4 py-2 text-slate-400 whitespace-nowrap"
                                                    >
                                                        {typeof val === "number"
                                                            ? val.toLocaleString()
                                                            : val}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ===== TEXT ===== */}
            {!hasCharts && hasText && (
                <div className="bg-[#1e293b]/90 border border-slate-700/60 rounded-xl p-6 text-slate-300 whitespace-pre-wrap shadow-lg shrink-0">
                    {data.content}
                </div>
            )}

            {/* ===== CODE ===== */}
            {!hasCharts && !hasText && hasCode && (
                <div className="bg-[#0f172a] border border-slate-700/60 rounded-xl p-5 text-sm text-blue-400 font-mono whitespace-pre-wrap shadow-lg overflow-x-auto shrink-0">
                    {hasCode}
                </div>
            )}

            {/* ===== FALLBACK ===== */}
            {!hasCharts && !hasTables && !hasText && !hasCode && (
                <div className="flex flex-col items-center justify-center p-12 text-slate-500 border border-dashed border-slate-700 rounded-xl bg-slate-800/20">
                    <FileJson size={40} className="mb-4 text-slate-600" />
                    <p className="font-medium">No valid output to display</p>
                </div>
            )}

            {/* ===== FULLSCREEN CHART MODAL ===== */}
            {fullscreenChart && (
                <div className="fixed inset-0 z-50 bg-[#0f172a]/90 backdrop-blur-md flex items-center justify-center p-4 lg:p-8">
                    <div 
                        className="bg-[#1e293b] w-full h-full max-w-7xl max-h-[95vh] rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                    >
                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-700/80 bg-slate-800/80">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                    <TrendingUp className="text-blue-400" size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-white">
                                    {typeof fullscreenChart.layout?.title === 'string' 
                                        ? fullscreenChart.layout.title 
                                        : fullscreenChart.layout?.title?.text || "Expanded Insight"}
                                </h3>
                            </div>
                            <button 
                                onClick={() => setFullscreenChart(null)}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Modal Chart Area */}
                        <div className="flex-1 w-full p-4 relative min-h-0 bg-gradient-to-b from-[#1e293b] to-[#0f172a]/50">
                            <Plot
                                data={fullscreenChart.data}
                                layout={{
                                    ...fullscreenChart.layout,
                                    title: null,
                                    autosize: true,
                                    paper_bgcolor: 'transparent',
                                    plot_bgcolor: 'transparent',
                                    font: { color: '#e2e8f0' }
                                }}
                                config={{ responsive: true, displayModeBar: true }}
                                style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
                                useResizeHandler={true}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalysisOutput;