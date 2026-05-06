import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Loader2,
  User,
  Bot,
  Table as TableIcon,
  X,
  Sparkles,
  Zap,
  TrendingUp,
  ClipboardCheck,
  BarChart3,
  Info,
  List
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://javax.onrender.com";

/**
 * Chat panel component.
 *
 * Props:
 *  - datasetId           : string  – ID of the uploaded dataset
 *  - onClose             : fn      – callback to close the panel
 *  - initialQuery        : string  – if set, this query is auto-fired when the
 *                                    panel first opens (Bug 1 fix)
 *  - onInitialQueryFired : fn      – called after initialQuery is sent, so the
 *                                    parent can clear it (prevents re-fire)
 *  - initialSummary      : string  – fallback welcome text when no initialQuery
 *  - savedMessages       : array   – previously persisted messages to restore
 *                                    (Bug 2 / persistence fix)
 */

const SummaryReport = ({ data }) => {
  if (!data) return null;

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in py-2">
      {/* Title & Overview */}
      <div className="space-y-2">
        <h3 className="text-[18px] font-serif font-bold text-anthropic-near-black leading-tight">
          {data.title}
        </h3>
        <p className="text-[13px] text-anthropic-stone-gray leading-relaxed italic">
          {data.overview}
        </p>
      </div>

      {/* Key Metrics Grid */}
      {data.key_metrics && data.key_metrics.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.key_metrics.map((metric, i) => (
            <div key={i} className="bg-white border border-anthropic-border-cream p-3 rounded-xl shadow-sm">
              <div className="text-[10px] uppercase tracking-wider text-anthropic-stone-gray mb-1 font-bold">
                {metric.label}
              </div>
              <div className="text-[16px] font-serif font-bold text-anthropic-terracotta">
                {metric.value}
              </div>
              {metric.plain_note && (
                <div className="text-[11px] text-anthropic-olive-gray mt-1 leading-snug">
                  {metric.plain_note}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Highlights */}
      {data.highlights && data.highlights.length > 0 && (
        <div className="bg-anthropic-warm-sand/30 border border-anthropic-border-cream rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-anthropic-terracotta" />
            <span className="text-[12px] font-bold uppercase tracking-tight text-anthropic-near-black">
              Key Highlights
            </span>
          </div>
          <ul className="space-y-2">
            {data.highlights.map((h, i) => (
              <li key={i} className="flex gap-2 text-[12px] text-anthropic-near-black leading-relaxed">
                <span className="text-anthropic-terracotta shrink-0">•</span>
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Sections */}
      {data.sections && data.sections.map((section, i) => (
        <div key={i} className="space-y-3">
          <div className="flex items-center gap-2 border-b border-anthropic-border-cream pb-1">
            <BarChart3 size={14} className="text-anthropic-olive-gray" />
            <h4 className="text-[14px] font-bold text-anthropic-near-black font-serif">
              {section.heading}
            </h4>
          </div>
          <p className="text-[12px] text-anthropic-stone-gray leading-relaxed">
            {section.body}
          </p>
          {section.subsections && (
            <div className="grid grid-cols-1 gap-2 pl-2">
              {section.subsections.map((sub, j) => (
                <div key={j} className="bg-white/50 border border-anthropic-border-cream/50 rounded-lg p-3">
                  <div className="text-[13px] font-bold text-anthropic-near-black mb-1">{sub.name}</div>
                  <div className="text-[11px] text-anthropic-terracotta font-medium mb-2 italic">"{sub.verdict}"</div>
                  <div className="flex flex-wrap gap-4">
                    {sub.stats && sub.stats.map((s, k) => (
                      <div key={k} className="flex flex-col">
                        <span className="text-[9px] uppercase text-anthropic-stone-gray font-bold">{s.label}</span>
                        <span className="text-[13px] font-serif font-bold text-anthropic-near-black">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <div className="bg-anthropic-near-black text-anthropic-ivory rounded-xl p-4 shadow-elegant">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardCheck size={14} className="text-anthropic-terracotta" />
            <span className="text-[12px] font-bold uppercase tracking-tight">
              Actionable Recommendations
            </span>
          </div>
          <ul className="space-y-3">
            {data.recommendations.map((r, i) => (
              <li key={i} className="flex gap-3 text-[12px] leading-relaxed">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-anthropic-terracotta/20 flex items-center justify-center text-anthropic-terracotta text-[10px] font-bold">
                  {i + 1}
                </div>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
const Chat = ({ datasetId, onClose, initialSummary, initialQuery, onInitialQueryFired, savedMessages, onShowCharts }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const initialized = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset initialized flag when datasetId changes so history is always re-fetched
  // for the correct dataset (e.g. when loading a different history item)
  useEffect(() => {
    initialized.current = false;
  }, [datasetId]);

  // ── On mount / datasetId change: restore history from backend, then fire initialQuery ──
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      let restoredMessages = [];

      // 1. If caller already passed savedMessages, use them directly.
      //    Otherwise fetch from backend.
      if (savedMessages && savedMessages.length > 0) {
        restoredMessages = savedMessages.flatMap((c) => [
          { role: "user", content: c.query },
          { 
            role: "assistant", 
            content: c.answer, 
            table: c.table || undefined,
            isSummary: c.is_summary || (typeof c.answer === 'string' && c.answer.includes('"report_type": "summary"'))
          },
        ]);
        setMessages(restoredMessages);
      } else if (datasetId) {
        // Try to load persisted chats from the backend
        setHistoryLoading(true);
        try {
          const res = await fetch(`${API_URL}/chats/${datasetId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.chats && data.chats.length > 0) {
              restoredMessages = data.chats.flatMap((c) => [
                { role: "user", content: c.query },
                { 
                  role: "assistant", 
                  content: c.answer, 
                  table: c.table || undefined,
                  isSummary: c.is_summary || (typeof c.answer === 'string' && c.answer.includes('"report_type": "summary"'))
                },
              ]);
              setMessages(restoredMessages);
            }
          }
        } catch (err) {
          console.warn("Could not load chat history:", err);
        } finally {
          setHistoryLoading(false);
        }
      }

      // 2. If an initialQuery was provided (user typed prompt before Execute),
      //    auto-fire it now so they don't have to retype — Bug 1 fix.
      if (initialQuery && datasetId) {
        // Notify parent to clear the initialQuery so it isn't re-fired on reopen
        onInitialQueryFired?.();
        const userMsg = { role: 'user', content: initialQuery };
        setMessages((prev) => [...prev, userMsg]);
        setLoading(true);

        try {
          const res = await fetch(`${API_URL}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              dataset_id: datasetId,
              query: initialQuery,
              history: restoredMessages,
            }),
          });
          if (!res.ok) throw new Error("Chat request failed");
          const data = await res.json();
          setMessages((prev) => [
            ...prev,
            { 
              role: "assistant", 
              content: data.answer, 
              table: data.table,
              isSummary: data.is_summary || (typeof data.answer === 'string' && data.answer.includes('"report_type": "summary"'))
            },
          ]);
        } catch (err) {
          console.error("Initial Chat Error:", err);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Sorry, I encountered an error while processing your request.",
              isError: true,
            },
          ]);
        } finally {
          setLoading(false);
        }
      } else if (initialSummary && restoredMessages.length === 0) {
        // Show welcome summary only when there's no previous history
        setMessages([{ role: "assistant", content: initialSummary }]);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading || !datasetId) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset_id: datasetId,
          query: input,
          history: messages,
        }),
      });

      if (!response.ok) throw new Error("Chat request failed");
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: data.answer, 
          table: data.table,
          isSummary: data.is_summary || (typeof data.answer === 'string' && data.answer.includes('"report_type": "summary"'))
        },
      ]);
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error while processing your request.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-anthropic-ivory border-l border-anthropic-border-cream overflow-hidden animate-fade-in-up">
      {/* Chat Header */}
      <div className="px-4 py-2.5 border-b border-anthropic-border-cream bg-anthropic-warm-sand/20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles size={14} className="text-anthropic-terracotta shrink-0" />
          <span className="text-[12px] font-semibold text-anthropic-near-black tracking-tight truncate">
            Data Assistant
          </span>
          <span className="text-[10px] text-anthropic-stone-gray hidden md:inline whitespace-nowrap opacity-60">· Real-time Analysis</span>
        </div>
        <div className="flex items-center gap-2">
          {onShowCharts && (
            <button
              onClick={onShowCharts}
              title="View Charts"
              className="flex items-center gap-1.5 px-2.5 py-1 text-anthropic-terracotta hover:bg-anthropic-terracotta/10 border border-anthropic-terracotta/20 transition-all text-[10px] font-bold uppercase tracking-tight"
            >
              <Zap size={13} />
              <span>Show Charts</span>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-anthropic-stone-gray hover:text-anthropic-near-black hover:bg-anthropic-warm-sand/50 transition-all"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-white/40">
        {/* Loading indicator while fetching old history */}
        {historyLoading && (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2 text-anthropic-stone-gray text-[12px]">
              <Loader2 size={14} className="animate-spin text-anthropic-terracotta" />
              <span>Loading previous conversation...</span>
            </div>
          </div>
        )}

        {messages.length === 0 && !historyLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <Bot size={48} className="mb-4 text-anthropic-olive-gray" />
            <p className="text-body-std text-anthropic-stone-gray max-w-[200px]">
              Ask me anything about the patterns in your dataset.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} animate-fade-in`}
          >
            <div
              className={`flex gap-3 max-w-[92%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex-shrink-0 flex items-center justify-center mt-1 ${msg.role === "user"
                    ? "text-anthropic-stone-gray"
                    : "text-anthropic-terracotta"
                  }`}
              >
                {msg.role === "user" ? <User size={16} /> : <Bot size={18} />}
              </div>
              <div
                className={`group relative p-4 text-body-sm leading-relaxed shadow-sm ${msg.role === "user"
                    ? "bg-anthropic-near-black text-anthropic-ivory"
                    : msg.isError
                      ? "bg-anthropic-error/10 border border-anthropic-error/20 text-anthropic-error"
                      : "bg-anthropic-warm-sand/50 border border-anthropic-border-cream text-anthropic-near-black"
                  }`}
              >
                {msg.isSummary ? (
                  <SummaryReport 
                    data={(() => {
                      try {
                        return typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
                      } catch (e) {
                        return null;
                      }
                    })()} 
                  />
                ) : (
                  msg.content
                )}

                {msg.table && (
                  <div className="mt-4 overflow-hidden border border-anthropic-border-cream bg-white/60 shadow-sm">
                    <div className="px-3 py-2 border-b border-anthropic-border-cream bg-anthropic-warm-sand/30 flex items-center gap-2">
                      <TableIcon size={12} className="text-anthropic-stone-gray" />
                      <span className="text-overline !text-[10px] text-anthropic-stone-gray">
                        Data Insight
                      </span>
                    </div>
                    <div className="overflow-x-auto max-h-[250px]">
                      <table className="min-w-full text-[11px] border-collapse">
                        <thead>
                          <tr className="bg-anthropic-parchment/30 text-anthropic-stone-gray">
                            {Object.keys(msg.table[0] || {}).map((col, i) => (
                              <th
                                key={i}
                                className="px-3 py-2 text-left font-medium border-b border-anthropic-border-cream"
                              >
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-anthropic-border-cream">
                          {msg.table.map((row, i) => (
                            <tr key={i} className="hover:bg-anthropic-warm-sand/10 transition-colors">
                              {Object.values(row).map((val, j) => (
                                <td
                                  key={j}
                                  className="px-3 py-2 text-anthropic-olive-gray whitespace-nowrap"
                                >
                                  {typeof val === "number" ? val.toLocaleString() : String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex-shrink-0 flex items-center justify-center mt-1 text-anthropic-terracotta">
              <Bot size={18} className="animate-pulse" />
            </div>
            <div className="bg-anthropic-warm-sand/30 border border-anthropic-border-cream p-4 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-anthropic-terracotta" />
              <span className="text-caption text-anthropic-stone-gray">
                Synthesizing answer...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSend}
        className="p-5 bg-anthropic-warm-sand/10 border-t border-anthropic-border-cream shrink-0"
      >
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={datasetId ? "Ask a follow-up question..." : "Analyze data first to chat"}
            disabled={!datasetId || loading}
            className="w-full anthropic-input pl-5 pr-14 py-3 disabled:opacity-50 disabled:cursor-not-allowed bg-white/80"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || !datasetId}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-anthropic-near-black hover:bg-anthropic-charcoal-warm disabled:bg-anthropic-stone-gray text-anthropic-ivory flex items-center justify-center transition-all active:scale-90 shadow-sm"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
        <div className="mt-3 flex justify-end items-center px-1">
          <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />
        </div>
      </form>
    </div>
  );
};

export default Chat;
