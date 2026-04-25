import React from "react";
import {
  BarChart3,
  TrendingUp,
  Database,
  FileText,
  Activity,
  PieChart,
  Layers,
} from "lucide-react";

const StatCard = ({ icon: Icon, label, value, trend, color, delay }) => (
  <div
    className="stat-card animate-fade-in-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center justify-between mb-4">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center border`}
        style={{ background: `${color}15`, borderColor: `${color}30` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      {trend !== undefined && (
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
            trend > 0
              ? "bg-emerald-500/10 text-emerald-600"
              : "bg-anthropic-error/10 text-anthropic-error"
          }`}
        >
          {trend > 0 ? "+" : ""}
          {trend}%
        </span>
      )}
    </div>
    <p className="text-sub-small text-anthropic-near-black mb-1">{value}</p>
    <p className="text-caption text-anthropic-stone-gray">{label}</p>
  </div>
);

const AnalyticsPage = ({ history = [] }) => {
  const completedCount = history.filter((h) => h.status === "completed").length;
  const errorCount = history.filter((h) => h.status === "error").length;
  const totalDatasets = new Set(history.map((h) => h.filename).filter(Boolean))
    .size;

  // Group analyses by date for activity chart
  const activityByDate = {};
  history.forEach((item) => {
    const date = item.created_at
      ? new Date(item.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "Unknown";
    activityByDate[date] = (activityByDate[date] || 0) + 1;
  });

  const activityDates = Object.entries(activityByDate).slice(-7);
  const maxActivity = Math.max(...activityDates.map(([, v]) => v), 1);

  return (
    <div className="page-container animate-fade-in-up">
      <div className="mb-10">
        <h1 className="text-display text-anthropic-near-black mb-2">
          Analytics
        </h1>
        <p className="text-body-std text-anthropic-stone-gray">
          A high-level view of your data analysis ecosystem.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={BarChart3}
          label="Total Analyses"
          value={history.length}
          color="var(--chart-blue)"
          delay={0}
        />
        <StatCard
          icon={TrendingUp}
          label="Completed"
          value={completedCount}
          trend={completedCount > 0 ? 12 : 0}
          color="var(--chart-green)"
          delay={100}
        />
        <StatCard
          icon={Database}
          label="Unique Datasets"
          value={totalDatasets}
          color="var(--chart-1)"
          delay={200}
        />
        <StatCard
          icon={Activity}
          label="Error Rate"
          value={
            history.length > 0
              ? `${Math.round((errorCount / history.length) * 100)}%`
              : "0%"
          }
          color={errorCount > 0 ? "var(--chart-red)" : "var(--chart-green)"}
          delay={300}
        />
      </div>

      {/* Activity Chart */}
      <div
        className="glass-card mb-8 p-8 animate-fade-in-up"
        style={{ animationDelay: "400ms" }}
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-feature text-anthropic-near-black font-medium">
            Intelligence Activity
          </h3>
          <span className="text-label text-anthropic-stone-gray uppercase tracking-widest font-bold">
            Last 7 Days
          </span>
        </div>
        <div className="flex items-end gap-4 h-[200px] px-2">
          {activityDates.length > 0 ? (
            activityDates.map(([date, count], i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <span className="text-label text-anthropic-focus font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  {count}
                </span>
                <div
                  className="w-full rounded-t-xl bg-[var(--bg-input)] group-hover:bg-anthropic-focus transition-all duration-500 ease-out"
                  style={{
                    height: `${(count / maxActivity) * 100}%`,
                    minHeight: "8px",
                  }}
                />
                <span className="text-[10px] text-anthropic-stone-gray font-bold uppercase tracking-wider">
                  {date}
                </span>
              </div>
            ))
          ) : (
            <div className="w-full flex items-center justify-center text-anthropic-stone-gray text-body-sm italic">
              No activity data recorded in this period.
            </div>
          )}
        </div>
      </div>

      {/* Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="glass-card p-8 animate-fade-in-up"
          style={{ animationDelay: "500ms" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-anthropic-terracotta/10 text-anthropic-terracotta rounded-lg">
              <PieChart size={18} />
            </div>
            <h3 className="text-feature text-anthropic-near-black">
              Status Distribution
            </h3>
          </div>
          <div className="space-y-4">
            {[
              { label: "Completed", count: completedCount, color: "var(--chart-green)" },
              { label: "Errors", count: errorCount, color: "var(--chart-red)" },
              {
                label: "Other",
                count: history.length - completedCount - errorCount,
                color: "var(--border-color)",
              },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-4">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: color }}
                />
                <span className="text-body-sm text-anthropic-olive-gray flex-1">
                  {label}
                </span>
                <span className="text-body-sm font-bold text-anthropic-near-black">
                  {count}
                </span>
                <div className="w-32 h-2 rounded-full bg-[var(--bg-input)] overflow-hidden border border-anthropic-border-cream">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${history.length > 0 ? (count / history.length) * 100 : 0}%`,
                      background: color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="glass-card p-8 animate-fade-in-up"
          style={{ animationDelay: "600ms" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-anthropic-focus/10 text-anthropic-focus rounded-lg">
              <Layers size={18} />
            </div>
            <h3 className="text-feature text-anthropic-near-black">
              Dominant Datasets
            </h3>
          </div>
          <div className="space-y-4">
            {(() => {
              const datasetCounts = {};
              history.forEach((item) => {
                if (item.filename) {
                  datasetCounts[item.filename] =
                    (datasetCounts[item.filename] || 0) + 1;
                }
              });
              const sorted = Object.entries(datasetCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

              if (sorted.length === 0) {
                return (
                  <p className="text-body-sm text-anthropic-stone-gray italic py-4">
                    No dataset history available.
                  </p>
                );
              }

              return sorted.map(([name, count]) => (
                <div key={name} className="flex items-center gap-4 group">
                  <div className="p-1.5 bg-[var(--bg-input)] rounded-lg group-hover:bg-[var(--bg-input)] transition-colors">
                    <FileText size={14} className="text-anthropic-stone-gray" />
                  </div>
                  <span className="text-body-sm text-anthropic-olive-gray flex-1 truncate">
                    {name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-label font-bold text-anthropic-near-black">
                      {count}
                    </span>
                    <span className="text-overline text-anthropic-stone-gray">
                      Executions
                    </span>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;