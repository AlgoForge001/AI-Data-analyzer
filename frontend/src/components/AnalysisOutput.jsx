import React, { useState } from "react";
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
} from "lucide-react";

const AnalysisOutput = ({ data, loading, activeTab = "summary" }) => {
  const [copied, setCopied] = useState(false);
  const [fullscreenChart, setFullscreenChart] = useState(null);

  const hasCharts =
    data?.charts && Array.isArray(data.charts) && data.charts.length > 0;
  const hasSummary = data?.summary || data?.content;
  const hasTables =
    data?.tables && Array.isArray(data.tables) && data.tables.length > 0;

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

  // ===== LOADING =====
  if (loading) {
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
  if (!data) {
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
    <div className="h-full overflow-y-auto bg-anthropic-ivory/30">
      {/* ===== SUMMARY VIEW ===== */}
      {activeTab === "summary" && (
        <div className="p-8 max-w-4xl mx-auto animate-fade-in-up">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-anthropic-terracotta/10 text-anthropic-terracotta rounded-xl border border-anthropic-terracotta/20">
                <FileText size={20} />
              </div>
              <h2 className="text-sub-small">Analysis Summary</h2>
            </div>
            {hasSummary && (
              <button
                onClick={() => copyToClipboard(hasSummary)}
                className="flex items-center gap-2 px-4 py-2 bg-anthropic-warm-sand text-anthropic-charcoal-warm rounded-xl text-label font-medium transition-all hover:bg-[#dfddd2] shadow-ring-warm"
              >
                {copied ? (
                  <Check size={14} className="text-emerald-600" />
                ) : (
                  <Copy size={14} />
                )}
                {copied ? "Copied" : "Copy Summary"}
              </button>
            )}
          </div>

          <div className="prose prose-anthropic max-w-none">
            <div className="text-body-std text-anthropic-charcoal-warm whitespace-pre-wrap leading-relaxed bg-white/40 p-8 rounded-[2rem] border border-anthropic-border-cream shadow-whisper">
              {hasSummary || "No summary available for this analysis."}
            </div>
          </div>

          {/* Key Insights / Quick Stats if available */}
          {data.insights && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {data.insights.map((insight, idx) => (
                <div key={idx} className="stat-card">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-anthropic-terracotta" />
                    <p className="text-label uppercase tracking-wider text-anthropic-stone-gray font-bold">
                      Insight {idx + 1}
                    </p>
                  </div>
                  <p className="text-body-sm text-anthropic-near-black font-medium">
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== CHARTS VIEW ===== */}
      {activeTab === "charts" && (
        <div className="p-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-anthropic-focus/10 text-anthropic-focus rounded-xl border border-anthropic-focus/20">
              <BarChart2 size={20} />
            </div>
            <h2 className="text-sub-small">Visual Intelligence</h2>
          </div>

          {hasCharts ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {data.charts.map((chart, index) => {
                const title =
                  chart.layout?.title?.text ||
                  chart.layout?.title ||
                  `Dynamic Chart ${index + 1}`;

                const optimizedLayout = {
                  ...chart.layout,
                  title: null,
                  autosize: true,
                  margin: { l: 40, r: 15, t: 15, b: 35 },
                  paper_bgcolor: "transparent",
                  plot_bgcolor: "transparent",
                  font: {
                    color: "var(--text-primary)",
                    size: 10,
                    family: "Anthropic Sans, sans-serif",
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
                };

                return (
                  <div
                    key={index}
                    className="stat-card !p-0 overflow-hidden flex flex-col group min-h-[320px]"
                  >
                    <div className="px-4 py-3 border-b border-anthropic-border-cream flex items-center justify-between bg-anthropic-warm-sand/20">
                      <h3 className="text-label font-bold text-anthropic-near-black truncate mr-2">
                        {title}
                      </h3>
                      <button
                        onClick={() => setFullscreenChart(chart)}
                        className="p-1.5 text-anthropic-stone-gray hover:text-anthropic-near-black hover:bg-anthropic-warm-sand/50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Maximize2 size={14} />
                      </button>
                    </div>
                    <div className="flex-1 w-full p-2 relative">
                      <Plot
                        data={chart.data}
                        layout={optimizedLayout}
                        config={{ responsive: true, displayModeBar: false }}
                        style={{ width: "100%", height: "100%" }}
                        useResizeHandler={true}
                      />
                    </div>
                    {chart.insight && (
                      <div className="px-4 py-3 bg-white border-t border-anthropic-border-cream/50">
                        <p className="text-[11px] leading-relaxed text-anthropic-charcoal-warm font-sans italic">
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
            <div className="flex flex-col items-center justify-center py-20 text-anthropic-stone-gray">
              <BarChart2 size={48} className="mb-4 opacity-20" />
              <p className="text-body-std">
                No charts were generated for this prompt.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "raw" && (
        <div className="p-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-anthropic-charcoal-warm/10 text-anthropic-charcoal-warm rounded-xl border border-anthropic-charcoal-warm/20">
                <TableIcon size={20} />
              </div>
              <h2 className="text-sub-small">Processed Data</h2>
            </div>
          </div>

          {hasTables ? (
            <div className="space-y-8">
              {data.tables.map((table, index) => (
                <div key={index} className="glass-card overflow-hidden">
                  <div className="px-6 py-4 border-b border-anthropic-border-cream bg-anthropic-warm-sand/20 flex items-center justify-between">
                    <h3 className="text-feature !text-[1rem]">
                      {table.title || "Dataset Partition"}
                    </h3>
                    <button
                      onClick={() =>
                        downloadCSV(table.data, `${table.title || "data"}.csv`)
                      }
                      className="flex items-center gap-2 px-3 py-1.5 bg-white text-anthropic-near-black border border-anthropic-border-cream rounded-lg text-label font-medium hover:bg-anthropic-warm-sand transition-all shadow-sm"
                    >
                      <Download size={14} />
                      Export CSV
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-anthropic-parchment/50">
                          {Object.keys(table.data[0] || {}).map((col, i) => (
                            <th
                              key={i}
                              className="px-6 py-3 text-overline text-anthropic-stone-gray border-b border-anthropic-border-cream"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-anthropic-border-cream">
                        {table.data.map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className="hover:bg-anthropic-warm-sand/10 transition-colors"
                          >
                            {Object.values(row).map((val, cIdx) => (
                              <td
                                key={cIdx}
                                className="px-6 py-4 text-body-sm text-anthropic-olive-gray whitespace-nowrap"
                              >
                                {typeof val === "number"
                                  ? val.toLocaleString()
                                  : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {table.insight && (
                    <div className="px-6 py-4 bg-anthropic-warm-sand/10 border-t border-anthropic-border-cream">
                      <p className="text-[12px] leading-relaxed text-anthropic-charcoal-warm italic">
                        <span className="font-bold text-anthropic-near-black mr-2 not-italic tracking-wide uppercase text-[10px]">Context:</span>
                        {table.insight}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-anthropic-stone-gray">
              <TableIcon size={48} className="mb-4 opacity-20" />
              <p className="text-body-std">No structured data tables found.</p>
            </div>
          )}
        </div>
      )}

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
