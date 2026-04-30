import React, { useState, useEffect, useRef } from "react";
import Plot from "react-plotly.js";
import {
  TrendingUp,
  Copy,
  Check,
  FileJson,
  Maximize2,
  X,
  BarChart2,
  Download,
  FileText,
  Layout,
  Table as TableIcon,
  ChevronDown,
  Zap,
  Loader2,
  Send,
} from "lucide-react";

const InlineInputBar = ({ onSubmitPrompt, isGenerating }) => {
  const [inlinePrompt, setInlinePrompt] = useState('');
  const inlineTextareaRef = useRef(null);

  // Auto-expand inline textarea
  useEffect(() => {
    if (inlineTextareaRef.current) {
      inlineTextareaRef.current.style.height = 'auto';
      inlineTextareaRef.current.style.height = `${Math.min(inlineTextareaRef.current.scrollHeight, 100)}px`;
    }
  }, [inlinePrompt]);

  const handleInlineSubmit = () => {
    if (!inlinePrompt.trim() || isGenerating || !onSubmitPrompt) return;
    onSubmitPrompt(inlinePrompt.trim());
    setInlinePrompt('');
  };

  const handleInlineKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleInlineSubmit();
    }
  };

  if (!onSubmitPrompt) return null;

  return (
    <div className="shrink-0 border-t border-anthropic-border-cream bg-white px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-end gap-2">
        <div className="flex-1 bg-anthropic-warm-sand/20 rounded-xl px-3 py-1 border border-anthropic-border-cream focus-within:border-anthropic-terracotta/40 transition-all">
          <textarea
            ref={inlineTextareaRef}
            value={inlinePrompt}
            onChange={(e) => setInlinePrompt(e.target.value)}
            onKeyDown={handleInlineKeyDown}
            placeholder="Type a follow-up prompt to generate more charts..."
            disabled={isGenerating}
            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-[13px] py-2 resize-none max-h-[100px] scrollbar-hide text-anthropic-near-black placeholder:text-anthropic-stone-gray disabled:opacity-50"
            rows={1}
          />
        </div>
        <button
          onClick={handleInlineSubmit}
          disabled={!inlinePrompt.trim() || isGenerating}
          className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-tight transition-all ${
            !inlinePrompt.trim() || isGenerating
              ? 'bg-anthropic-warm-sand/50 text-anthropic-stone-gray cursor-not-allowed'
              : 'bg-anthropic-terracotta text-white hover:bg-anthropic-terracotta/90 active:scale-95 shadow-sm'
          }`}
        >
          {isGenerating ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Zap size={14} fill="currentColor" />
          )}
          <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'Execute'}</span>
        </button>
      </div>
      {!isGenerating && inlinePrompt.trim() && (
        <p className="text-[10px] text-anthropic-stone-gray text-center mt-1.5">
          Press <span className="font-bold">Ctrl + Enter</span> to execute
        </p>
      )}
    </div>
  );
};

const AnalysisOutput = ({ data, loading, activeTab = "summary", history = [], onSubmitPrompt, isGenerating = false }) => {
  const [copied, setCopied] = useState(false);
  const [fullscreenChart, setFullscreenChart] = useState(null);
  const bottomRef = useRef(null);

  // Fallback to single data if no history provided
  const items = history && history.length > 0 ? history : (data ? [{ query: data.query || "Analysis Result", data, timestamp: new Date().toISOString() }] : []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [items]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCSV = (tableData, filename = "table.csv") => {
    if (!tableData || tableData.length === 0) return;
    const headers = Object.keys(tableData[0]);
    const csvRows = [
      headers.join(","),
      ...tableData.map((row) =>
        headers.map((field) => `"${row[field] ?? ""}"`).join(","),
      ),
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

  // ===== LOADING (only show full spinner on first load when no history exists) =====
  if (loading && !items.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-20 animate-pulse">
        <div className="mb-6 p-5 bg-anthropic-terracotta/10 rounded-full border border-anthropic-terracotta/20">
          <TrendingUp
            size={48}
            className="animate-bounce text-anthropic-terracotta"
          />
        </div>
        <h3 className="text-sub-small text-anthropic-near-black mb-2 text-center">
          Synthesizing Intelligence...
        </h3>
        <p className="text-anthropic-stone-gray text-body-sm text-center">
          Building interactive visualizations and extracting patterns
        </p>
      </div>
    );
  }

  // ===== EMPTY =====
  if (!items.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-anthropic-ivory/50">
        <div className="w-20 h-20 bg-anthropic-warm-sand/30 rounded-full flex items-center justify-center mb-6 border border-anthropic-border-cream">
          <Layout size={32} className="text-anthropic-stone-gray" />
        </div>
        <h3 className="text-sub-small text-anthropic-near-black mb-2">
          Ready for Analysis
        </h3>
        <p className="text-anthropic-stone-gray max-w-sm text-body-sm">
          Upload a dataset and provide instructions to see the magic happen
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-anthropic-ivory/30">
      <div className="flex-1 overflow-y-auto pb-4 scroll-smooth">
        <div className="max-w-5xl mx-auto flex flex-col gap-8 p-4 sm:p-8">
        {items.map((item, idx) => {
          const stableKey = `${item.timestamp || idx}-${(item.query || '').slice(0, 20)}`;
          const itemData = item.data;
          const isPending = item._pending || (!itemData && item.query);
          
          const hasCharts = itemData?.charts && Array.isArray(itemData.charts) && itemData.charts.length > 0;
          const hasSummary = itemData?.summary || itemData?.content;
          const hasTables = itemData?.tables && Array.isArray(itemData.tables) && itemData.tables.length > 0;

          return (
            <div key={stableKey} className="flex flex-col gap-6 animate-fade-in-up">
              
              {/* User Prompt Bubble */}
              {item.query && (
                <div className="flex justify-end">
                  <div className="bg-anthropic-near-black text-white px-5 py-3.5 rounded-2xl rounded-tr-sm max-w-[85%] sm:max-w-[75%] shadow-sm">
                    <p className="text-body-std whitespace-pre-wrap">{item.query}</p>
                    {item.timestamp && (
                      <span className="text-[10px] text-anthropic-stone-gray/70 mt-2 block">
                        {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Pending / Loading state for this specific entry */}
              {isPending && (
                <div className="flex items-center gap-3 py-6 px-4 animate-pulse">
                  <div className="p-3 bg-anthropic-terracotta/10 rounded-full border border-anthropic-terracotta/20">
                    <Loader2 size={20} className="animate-spin text-anthropic-terracotta" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-anthropic-near-black">Generating charts...</p>
                    <p className="text-[11px] text-anthropic-stone-gray">Building visualizations for your prompt</p>
                  </div>
                </div>
              )}

              {/* AI Response / Result Area — only when data exists */}
              {itemData && (
              <div className="flex flex-col gap-4">
                
                {/* SUMMARY TAB equivalent */}
                {(activeTab === "summary" || activeTab === "all") && hasSummary && (
                  <div className="glass-card p-6 border border-anthropic-border-cream">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-1.5 bg-anthropic-terracotta/10 text-anthropic-terracotta rounded-lg">
                        <FileText size={16} />
                      </div>
                      <h3 className="text-[13px] font-bold text-anthropic-near-black uppercase tracking-wider">Analysis Summary</h3>
                    </div>
                    <div className="text-body-std text-anthropic-charcoal-warm whitespace-pre-wrap leading-relaxed">
                      {hasSummary}
                    </div>
                    
                    {itemData.insights && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {itemData.insights.map((insight, i) => (
                          <div key={i} className="p-4 bg-white rounded-xl border border-anthropic-border-cream shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-anthropic-terracotta mb-2" />
                            <p className="text-body-sm text-anthropic-near-black font-medium">{insight}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* CHARTS VIEW equivalent */}
                {(activeTab === "charts" || activeTab === "all") && (
                  <div className="w-full">
                    {hasCharts ? (
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                        {itemData.charts.map((chart, index) => {
                          const title = chart.layout?.title?.text || chart.layout?.title || `Dynamic Chart ${index + 1}`;
                          const optimizedLayout = {
                            ...chart.layout,
                            title: null,
                            autosize: true,
                            margin: { l: 30, r: 10, t: 15, b: 35 },
                            paper_bgcolor: "transparent",
                            plot_bgcolor: "transparent",
                            font: { color: "var(--text-primary)", size: 10, family: "Anthropic Sans, sans-serif" },
                            colorway: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)", "var(--chart-7)"],
                          };

                          return (
                            <div key={index} className="stat-card !p-0 overflow-hidden flex flex-col group min-w-0 w-full bg-white shadow-sm border-anthropic-border-cream">
                              <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-anthropic-border-cream flex items-center justify-between bg-anthropic-warm-sand/20">
                                <h3 className="text-[12px] sm:text-label font-bold text-anthropic-near-black truncate mr-2 w-full">{title}</h3>
                                <button onClick={() => setFullscreenChart(chart)} className="p-1 sm:p-1.5 text-anthropic-stone-gray hover:text-anthropic-near-black hover:bg-anthropic-warm-sand/50 rounded-lg sm:opacity-0 sm:group-hover:opacity-100 transition-all shrink-0">
                                  <Maximize2 size={14} />
                                </button>
                              </div>
                              <div className="w-full h-[300px] sm:h-[350px] p-1 sm:p-2">
                                <Plot data={chart.data} layout={optimizedLayout} config={{ responsive: true, displayModeBar: false }} style={{ width: "100%", height: "100%" }} useResizeHandler={true} />
                              </div>
                              {chart.insight && (
                                <div className="px-3 sm:px-4 py-2 sm:py-3 bg-white border-t border-anthropic-border-cream/50">
                                  <p className="text-[10px] sm:text-[11px] leading-relaxed text-anthropic-charcoal-warm font-sans italic line-clamp-3 sm:line-clamp-none">
                                    <span className="font-bold text-anthropic-terracotta mr-1.5 not-italic tracking-wider uppercase text-[9px]">Insight:</span>
                                    {chart.insight}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      activeTab === "charts" && (
                        <div className="flex flex-col items-center justify-center py-10 text-anthropic-stone-gray bg-white/50 rounded-2xl border border-anthropic-border-cream border-dashed">
                          <BarChart2 size={32} className="mb-3 opacity-30" />
                          <p className="text-[13px]">No charts generated for this prompt.</p>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* RAW TABLES VIEW */}
                {(activeTab === "raw" || activeTab === "all") && hasTables && (
                  <div className="space-y-6 mt-2">
                    {itemData.tables.map((table, index) => (
                      <div key={index} className="bg-white rounded-2xl border border-anthropic-border-cream shadow-sm overflow-hidden">
                        <div className="px-5 py-3 border-b border-anthropic-border-cream bg-anthropic-warm-sand/20 flex items-center justify-between">
                          <h3 className="text-[13px] font-bold text-anthropic-near-black">{table.title || "Dataset Partition"}</h3>
                          <button onClick={() => downloadCSV(table.data, `${table.title || "data"}.csv`)} className="flex items-center gap-2 px-3 py-1.5 bg-white text-anthropic-near-black border border-anthropic-border-cream rounded-lg text-[11px] font-medium hover:bg-anthropic-warm-sand transition-all shadow-sm">
                            <Download size={12} /> Export CSV
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-anthropic-parchment/50">
                                {Object.keys(table.data[0] || {}).map((col, i) => (
                                  <th key={i} className="px-4 py-2 text-[10px] uppercase tracking-wider font-bold text-anthropic-stone-gray border-b border-anthropic-border-cream">{col}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-anthropic-border-cream">
                              {table.data.slice(0, 10).map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-anthropic-warm-sand/10 transition-colors">
                                  {Object.values(row).map((val, cIdx) => (
                                    <td key={cIdx} className="px-4 py-2.5 text-[12px] text-anthropic-olive-gray whitespace-nowrap">{typeof val === "number" ? val.toLocaleString() : String(val)}</td>
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
              </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>

    {/* ── Inline Prompt Input (pinned at bottom of chart panel) ── */}
    <InlineInputBar onSubmitPrompt={onSubmitPrompt} isGenerating={isGenerating} />

      {/* ===== FULLSCREEN CHART MODAL ===== */}
      {fullscreenChart && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-8">
          <div className="bg-[var(--bg-base)] w-full h-full max-w-6xl max-h-[90vh] rounded-[2.5rem] shadow-2xl border border-[var(--border-color)] flex flex-col overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center px-8 py-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-anthropic-terracotta/10 rounded-xl border border-anthropic-terracotta/20">
                  <TrendingUp className="text-anthropic-terracotta" size={20} />
                </div>
                <h3 className="text-sub-small">
                  {typeof fullscreenChart.layout?.title === "string"
                    ? fullscreenChart.layout.title
                    : fullscreenChart.layout?.title?.text || "Expanded Insight"}
                </h3>
              </div>
              <button
                onClick={() => setFullscreenChart(null)}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)] rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 w-full p-8 relative min-h-0">
              <Plot
                data={fullscreenChart.data}
                layout={{
                  ...fullscreenChart.layout,
                  paper_bgcolor: "transparent",
                  plot_bgcolor: "transparent",
                  font: {
                    family: "Anthropic Sans, sans-serif",
                    color: "var(--text-primary)",
                  },
                  colorway: [
                    "var(--chart-1)",
                    "var(--chart-2)",
                    "var(--chart-3)",
                    "var(--chart-4)",
                    "var(--chart-5)",
                    "var(--chart-6)",
                    "var(--chart-7)"
                  ],
                }}
                config={{ responsive: true, displayModeBar: true }}
                style={{ width: "100%", height: "100%" }}
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
