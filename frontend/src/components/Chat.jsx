import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Loader2,
  User,
  Bot,
  Table as TableIcon,
  X,
  Sparkles,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const Chat = ({ datasetId, onClose, initialSummary }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Pre-populate with summary message when panel opens
  useEffect(() => {
    if (initialSummary && messages.length === 0) {
      setMessages([{ role: "assistant", content: initialSummary }]);
    }
  }, [initialSummary, messages.length]);

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

      const assistantMessage = {
        role: "assistant",
        content: data.answer,
        table: data.table,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error while processing your request.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-anthropic-ivory border border-anthropic-border-cream overflow-hidden shadow-whisper animate-fade-in-up">
      {/* Chat Header */}
      <div className="px-6 py-5 border-b border-anthropic-border-cream bg-anthropic-warm-sand/20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-anthropic-terracotta/10 flex items-center justify-center border border-anthropic-terracotta/20">
            <Sparkles size={18} className="text-anthropic-terracotta" />
          </div>
          <div>
            <h3 className="text-body-nav font-medium text-anthropic-near-black">
              Data Assistant
            </h3>
            <p className="text-overline !text-[9px] text-anthropic-stone-gray">
              Real-time Analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-anthropic-stone-gray hover:text-anthropic-near-black hover:bg-anthropic-warm-sand/50 rounded-lg transition-all"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-white/40">
        {messages.length === 0 && (
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
                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${
                  msg.role === "user"
                    ? "bg-anthropic-charcoal-warm/10 border-anthropic-charcoal-warm/20 text-anthropic-charcoal-warm"
                    : "bg-anthropic-terracotta/10 border-anthropic-terracotta/20 text-anthropic-terracotta"
                }`}
              >
                {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div
                className={`group relative p-4 rounded-2xl text-body-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-anthropic-near-black text-anthropic-ivory rounded-tr-sm"
                    : msg.isError
                      ? "bg-anthropic-error/10 border border-anthropic-error/20 text-anthropic-error rounded-tl-sm"
                      : "bg-anthropic-warm-sand/50 border border-anthropic-border-cream text-anthropic-near-black rounded-tl-sm"
                }`}
              >
                {msg.content}

                {msg.table && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-anthropic-border-cream bg-white/60 shadow-sm">
                    <div className="px-3 py-2 border-b border-anthropic-border-cream bg-anthropic-warm-sand/30 flex items-center gap-2">
                      <TableIcon
                        size={12}
                        className="text-anthropic-stone-gray"
                      />
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
                            <tr
                              key={i}
                              className="hover:bg-anthropic-warm-sand/10 transition-colors"
                            >
                              {Object.values(row).map((val, j) => (
                                <td
                                  key={j}
                                  className="px-3 py-2 text-anthropic-olive-gray whitespace-nowrap"
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
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-anthropic-terracotta/10 border border-anthropic-terracotta/20 flex items-center justify-center text-anthropic-terracotta">
              <Bot size={14} className="animate-pulse" />
            </div>
            <div className="bg-anthropic-warm-sand/30 border border-anthropic-border-cream p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
              <Loader2
                size={16}
                className="animate-spin text-anthropic-terracotta"
              />
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
            placeholder={
              datasetId ? "Ask a question..." : "Analyze data first to chat"
            }
            disabled={!datasetId || loading}
            className="w-full anthropic-input pl-5 pr-14 py-3 disabled:opacity-50 disabled:cursor-not-allowed bg-white/80"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || !datasetId}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-anthropic-near-black hover:bg-anthropic-charcoal-warm disabled:bg-anthropic-stone-gray text-anthropic-ivory rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-sm"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
        <div className="mt-3 flex justify-end items-center px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </form>
    </div>
  );
};

export default Chat;
