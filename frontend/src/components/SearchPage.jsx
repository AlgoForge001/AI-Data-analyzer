import React, { useState } from "react";
import {
  Search as SearchIcon,
  FileText,
  Clock,
  Filter,
  X,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

const SearchPage = ({ history = [], onHistoryItemClick }) => {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredResults = history.filter((item) => {
    const matchesQuery =
      !query ||
      (item.query && item.query.toLowerCase().includes(query.toLowerCase())) ||
      (item.filename &&
        item.filename.toLowerCase().includes(query.toLowerCase()));
    const matchesFilter = filterType === "all" || item.status === filterType;
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="page-container animate-fade-in-up">
      <div className="mb-10">
        <h1 className="text-display text-anthropic-near-black mb-2">
          Search
        </h1>
        <p className="text-body-std text-anthropic-stone-gray">
          Query your historical analysis vault.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8 group">
        <SearchIcon
          className="absolute left-6 top-1/2 -translate-y-1/2 text-anthropic-stone-gray group-focus-within:text-anthropic-focus transition-colors"
          size={22}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search datasets, queries, or specific insights..."
          className="w-full anthropic-input pl-16 pr-14 py-5 text-body-std shadow-whisper !bg-[var(--bg-input)]"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-1.5 text-anthropic-stone-gray hover:text-anthropic-near-black rounded-lg hover:bg-[var(--bg-input)] transition-all"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-input)] rounded-lg text-label font-bold text-anthropic-stone-gray uppercase tracking-widest shrink-0">
          <Filter size={14} />
          Filter By
        </div>
        {["all", "completed", "error", "cancelled"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-6 py-2 rounded-xl text-body-sm font-medium capitalize transition-all border shrink-0 ${filterType === type
                ? "bg-[var(--text-primary)] text-[var(--bg-base)] border-[var(--text-primary)] shadow-lg"
                : "bg-[var(--bg-card)] text-anthropic-stone-gray border-anthropic-border-cream hover:border-anthropic-border-warm hover:text-anthropic-near-black"
              }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {filteredResults.length > 0 ? (
          filteredResults.map((item, idx) => (
            <div
              key={item.task_id}
              onClick={() => onHistoryItemClick(item.task_id)}
              className="glass-card flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 cursor-pointer group animate-fade-in-up hover:translate-x-1"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--bg-input)] flex items-center justify-center border border-anthropic-border-cream shrink-0 group-hover:bg-anthropic-terracotta/10 group-hover:border-anthropic-terracotta/20 transition-all">
                <MessageSquare
                  size={20}
                  className="text-anthropic-stone-gray group-hover:text-anthropic-terracotta transition-colors sm:w-6 sm:h-6"
                />
              </div>
              <div className="flex-1 min-w-0 w-full">
                <h3 className="text-feature text-anthropic-near-black truncate mb-1.5 line-clamp-2 sm:line-clamp-1 whitespace-normal sm:whitespace-nowrap">
                  {item.query || "Untitled Intelligence Query"}
                </h3>
                <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                  {item.filename && (
                    <span className="flex items-center gap-2 text-label text-anthropic-stone-gray uppercase tracking-wider font-medium truncate max-w-full">
                      <FileText size={12} className="shrink-0" />
                      <span className="truncate">{item.filename}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-2 text-label text-anthropic-stone-gray uppercase tracking-wider font-medium shrink-0">
                    <Clock size={12} />
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })
                      : "Unknown Date"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 mt-2 sm:mt-0">
                <span
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${item.status === "completed"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : item.status === "error"
                        ? "bg-anthropic-error/10 text-anthropic-error border-anthropic-error/20"
                        : "bg-[var(--bg-input)] text-anthropic-stone-gray border-anthropic-border-cream"
                    }`}
                >
                  {item.status || "Processing"}
                </span>
                <ArrowRight size={18} className="text-anthropic-border-warm group-hover:text-anthropic-near-black group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-[var(--bg-input)] rounded-[3rem] border border-dashed border-anthropic-border-warm">
            <div className="w-20 h-20 bg-[var(--bg-input)] rounded-full flex items-center justify-center mb-6">
              <SearchIcon size={32} className="text-anthropic-stone-gray opacity-30" />
            </div>
            <h3 className="text-sub-small text-anthropic-near-black mb-2">No matching records</h3>
            <p className="text-body-std text-anthropic-stone-gray max-w-xs">
              We couldn't find any analyses matching your search terms or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
