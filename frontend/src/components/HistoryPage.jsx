import React, { useState } from "react";
import {
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  error: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  cancelled: {
    icon: AlertTriangle,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  running: {
    icon: Clock,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
};

const HistoryPage = ({ history = [], onHistoryItemClick, onDeleteHistoryItem }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered =
    filterStatus === "all"
      ? history
      : history.filter((h) => h.status === filterStatus);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="page-container animate-fade-in-up">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <h1 className="text-display text-anthropic-near-black mb-2">History</h1>
          <span className="text-label text-anthropic-stone-gray uppercase tracking-widest font-bold">
            {filtered.length} total
          </span>
        </div>
        <p className="text-body-std text-anthropic-stone-gray">
          Full paginated list of past analyses.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-input)] rounded-lg text-label font-bold text-anthropic-stone-gray uppercase tracking-widest shrink-0">
          <Filter size={14} />
          Filter
        </div>
        {["all", "completed", "error", "cancelled"].map((type) => (
          <button
            key={type}
            onClick={() => {
              setFilterStatus(type);
              setCurrentPage(1);
            }}
            className={`px-6 py-2 rounded-xl text-body-sm font-medium capitalize transition-all border shrink-0 ${
              filterStatus === type
                ? "bg-[var(--text-primary)] text-[var(--bg-base)] border-[var(--text-primary)] shadow-lg"
                : "bg-[var(--bg-card)] text-anthropic-stone-gray border-[var(--border-color)] hover:text-anthropic-near-black"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* History List */}
      <div className="space-y-3 mb-8">
        {paginated.length > 0 ? (
          paginated.map((item, idx) => {
            const config = statusConfig[item.status] || statusConfig.running;
            const StatusIcon = config.icon;
            return (
              <div
                key={item.task_id}
                onClick={() => onHistoryItemClick(item.task_id)}
                className="glass-card flex items-center gap-5 p-5 cursor-pointer group animate-fade-in-up hover:translate-x-1"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div
                  className={`w-11 h-11 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center shrink-0`}
                >
                  <StatusIcon size={18} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-feature text-anthropic-near-black truncate group-hover:text-anthropic-focus transition-colors">
                    {item.query || "Untitled Analysis"}
                  </p>
                  <div className="flex items-center gap-5 mt-1.5">
                    {item.filename && (
                      <span className="flex items-center gap-2 text-label text-anthropic-stone-gray uppercase tracking-wider font-medium">
                        <FileText size={12} /> {item.filename}
                      </span>
                    )}
                    <span className="flex items-center gap-2 text-label text-anthropic-stone-gray uppercase tracking-wider font-medium">
                      <Clock size={12} />
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })
                        : "N/A"}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${config.bg} ${config.color} ${config.border}`}
                >
                  {item.status || "unknown"}
                </span>
                <button
                  onClick={(e) => onDeleteHistoryItem && onDeleteHistoryItem(item.task_id, e)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-anthropic-stone-gray hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Delete Analysis"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-[var(--bg-card)] rounded-[2rem] border border-dashed border-[var(--border-color)]">
            <div className="w-20 h-20 bg-[var(--bg-input)] rounded-full flex items-center justify-center mb-6">
              <Clock size={32} className="text-anthropic-stone-gray opacity-30" />
            </div>
            <h3 className="text-sub-small text-anthropic-near-black mb-2">No history items found</h3>
            <p className="text-body-std text-anthropic-stone-gray max-w-xs">
              Run an analysis to see it here.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl text-anthropic-stone-gray hover:text-anthropic-near-black hover:bg-[var(--bg-input)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-xl text-body-sm font-medium transition-all ${
                currentPage === page
                  ? "bg-anthropic-focus/10 text-anthropic-focus border border-anthropic-focus/20"
                  : "text-anthropic-stone-gray hover:text-anthropic-near-black hover:bg-[var(--bg-input)]"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl text-anthropic-stone-gray hover:text-anthropic-near-black hover:bg-[var(--bg-input)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
