/**
 * chartConverter.js
 *
 * Converts the backend's custom chart format into Plotly-compatible
 * { data, layout, insight } objects that react-plotly.js can render.
 *
 * Backend format examples:
 *   { type: "bar", title: "...", x: [...], y: [...], x_label, y_label, layout_size, y_range }
 *   { type: "histogram", title: "...", values: [...], x_label, bin_size, x_range, stats }
 *   { type: "box", title: "...", groups: [{name, values}], y_range, stats }
 *   { type: "heatmap", title: "...", x, y, z, cell_annotations, use_log_scale }
 *   { type: "bubble", title: "...", x, y, sizes, size_label }
 *   { type: "funnel", title: "...", x, y, conversion_pcts, biggest_drop_idx }
 *   { type: "treemap", title: "...", labels, values }
 *   { type: "waterfall", title: "...", x, y }
 *   { type: "line"|"area"|"stacked_bar"|"grouped_bar", series: [{name, x, y}] }
 */

// Warm, professional color palette matching the app's terracotta aesthetic
const CHART_COLORS = [
  "#B85C45", // terracotta (primary)
  "#5B8A72", // sage green
  "#D4956A", // warm amber
  "#6B7FA3", // slate blue
  "#C97B84", // dusty rose
  "#7BA69E", // teal
  "#A67C52", // warm brown
  "#8E7CC3", // muted purple
  "#C4A35A", // gold
  "#6A9BC3", // steel blue
  "#D48B6A", // salmon
  "#8BAA7F", // moss
];

/**
 * Returns true if the chart object is already in Plotly-native format
 * (has a `data` array), so no conversion is needed.
 */
function isAlreadyPlotly(chart) {
  return chart && Array.isArray(chart.data);
}

/**
 * Converts a single backend chart object to Plotly { data, layout, insight } format.
 */
export function convertChartToPlotly(chart) {
  if (!chart) return null;

  // If it's already Plotly format, pass through
  if (isAlreadyPlotly(chart)) {
    return {
      data: chart.data,
      layout: chart.layout || {},
      insight: chart.insight || null,
    };
  }

  const chartType = chart.type || "bar";
  const title = chart.title || "";

  // Base layout
  const layout = {
    title: { text: title, font: { size: 14 } },
    autosize: true,
    xaxis: {
      title: { text: chart.x_label || "", standoff: 10 },
      automargin: true,
    },
    yaxis: {
      title: { text: chart.y_label || "", standoff: 10 },
      automargin: true,
    },
    margin: { l: 60, r: 20, t: 40, b: 50 },
    showlegend: false,
    colorway: CHART_COLORS,
  };

  // Apply y_range if backend computed one (outlier zoom)
  if (chart.y_range) {
    layout.yaxis.range = chart.y_range;
  }

  let data = [];
  let insight = null;

  switch (chartType) {
    // ── BAR ──────────────────────────────────────────────
    case "bar": {
      if (chart.series && Array.isArray(chart.series)) {
        data = chart.series.map((s, i) => ({
          type: "bar",
          x: s.x,
          y: s.y,
          name: s.name,
          marker: { color: CHART_COLORS[i % CHART_COLORS.length] },
        }));
        layout.showlegend = true;
      } else {
        data = [{
          type: "bar",
          x: chart.x || [],
          y: chart.y || [],
          marker: {
            color: CHART_COLORS[0],
            line: { width: 0.5, color: "rgba(0,0,0,0.1)" },
          },
        }];
      }
      break;
    }

    // ── STACKED BAR ─────────────────────────────────────
    case "stacked_bar": {
      if (chart.series && Array.isArray(chart.series)) {
        data = chart.series.map((s, i) => ({
          type: "bar",
          x: s.x,
          y: s.y,
          name: s.name,
          marker: { color: CHART_COLORS[i % CHART_COLORS.length] },
        }));
      } else {
        data = [{ type: "bar", x: chart.x || [], y: chart.y || [], marker: { color: CHART_COLORS[0] } }];
      }
      layout.barmode = "stack";
      layout.showlegend = true;
      break;
    }

    // ── GROUPED BAR ─────────────────────────────────────
    case "grouped_bar": {
      if (chart.series && Array.isArray(chart.series)) {
        data = chart.series.map((s, i) => ({
          type: "bar",
          x: s.x,
          y: s.y,
          name: s.name,
          marker: { color: CHART_COLORS[i % CHART_COLORS.length] },
        }));
      } else {
        data = [{ type: "bar", x: chart.x || [], y: chart.y || [], marker: { color: CHART_COLORS[0] } }];
      }
      layout.barmode = "group";
      layout.showlegend = true;
      break;
    }

    // ── LINE ────────────────────────────────────────────
    case "line": {
      if (chart.series && Array.isArray(chart.series)) {
        data = chart.series.map((s, i) => ({
          type: "scatter",
          mode: "lines+markers",
          x: s.x,
          y: s.y,
          name: s.name,
          line: { width: 2, color: CHART_COLORS[i % CHART_COLORS.length] },
          marker: { size: 4 },
        }));
        layout.showlegend = true;
      } else {
        data = [{
          type: "scatter",
          mode: "lines+markers",
          x: chart.x || [],
          y: chart.y || [],
          line: { width: 2.5, color: CHART_COLORS[0], shape: "spline" },
          marker: { size: 5, color: CHART_COLORS[0] },
        }];
      }
      break;
    }

    // ── AREA ────────────────────────────────────────────
    case "area": {
      if (chart.series && Array.isArray(chart.series)) {
        data = chart.series.map((s, i) => ({
          type: "scatter",
          mode: "lines",
          fill: i === 0 ? "tozeroy" : "tonexty",
          x: s.x,
          y: s.y,
          name: s.name,
          line: { width: 1.5, color: CHART_COLORS[i % CHART_COLORS.length] },
          fillcolor: CHART_COLORS[i % CHART_COLORS.length] + "30",
        }));
        layout.showlegend = true;
      } else {
        data = [{
          type: "scatter",
          mode: "lines",
          fill: "tozeroy",
          x: chart.x || [],
          y: chart.y || [],
          line: { width: 2, color: CHART_COLORS[0], shape: "spline" },
          fillcolor: CHART_COLORS[0] + "25",
        }];
      }
      break;
    }

    // ── SCATTER ─────────────────────────────────────────
    case "scatter": {
      if (chart.series && Array.isArray(chart.series)) {
        data = chart.series.map((s, i) => ({
          type: "scatter",
          mode: "markers",
          x: s.x,
          y: s.y,
          name: s.name,
          marker: { size: 7, color: CHART_COLORS[i % CHART_COLORS.length], opacity: 0.7 },
        }));
        layout.showlegend = true;
      } else {
        data = [{
          type: "scatter",
          mode: "markers",
          x: chart.x || [],
          y: chart.y || [],
          marker: {
            size: 7,
            color: CHART_COLORS[0],
            opacity: 0.7,
            line: { width: 1, color: "rgba(0,0,0,0.15)" },
          },
        }];
      }
      break;
    }

    // ── PIE ──────────────────────────────────────────────
    case "pie": {
      data = [{
        type: "pie",
        labels: chart.x || [],
        values: chart.y || [],
        marker: { colors: CHART_COLORS },
        hole: 0.4,
        textinfo: "label+percent",
        textposition: "outside",
        textfont: { size: 10 },
      }];
      delete layout.xaxis;
      delete layout.yaxis;
      break;
    }

    // ── HISTOGRAM ───────────────────────────────────────
    case "histogram": {
      const trace = {
        type: "histogram",
        x: chart.values || chart.x || [],
        marker: {
          color: CHART_COLORS[0] + "CC",
          line: { width: 1, color: CHART_COLORS[0] },
        },
      };
      if (chart.bin_size) {
        trace.xbins = { size: chart.bin_size };
      }
      data = [trace];

      // Apply axis zoom if backend detected outliers
      if (chart.x_range) {
        layout.xaxis.range = chart.x_range;
      }

      // Add mean/median reference lines
      if (chart.stats) {
        const s = chart.stats;
        if (s.mean !== undefined) {
          layout.shapes = layout.shapes || [];
          layout.shapes.push({
            type: "line",
            xref: "x", yref: "paper",
            x0: s.mean, x1: s.mean, y0: 0, y1: 1,
            line: { color: "#E74C3C", width: 2, dash: "dash" },
          });
          layout.annotations = layout.annotations || [];
          layout.annotations.push({
            x: s.mean, y: 1, yref: "paper", xref: "x",
            text: `Mean: ${s.mean.toLocaleString()}`,
            showarrow: false, yanchor: "bottom",
            font: { size: 9, color: "#E74C3C" },
            bgcolor: "rgba(255,255,255,0.8)",
          });
        }
        if (s.median !== undefined) {
          layout.shapes = layout.shapes || [];
          layout.shapes.push({
            type: "line",
            xref: "x", yref: "paper",
            x0: s.median, x1: s.median, y0: 0, y1: 1,
            line: { color: "#2980B9", width: 2, dash: "dot" },
          });
        }

        // Build insight text
        const parts = [];
        if (s.mean !== undefined) parts.push(`Mean: ${Number(s.mean).toLocaleString()}`);
        if (s.median !== undefined) parts.push(`Median: ${Number(s.median).toLocaleString()}`);
        if (s.skewness !== undefined) {
          const dir = s.skewness > 0.5 ? "right-skewed" : s.skewness < -0.5 ? "left-skewed" : "roughly symmetric";
          parts.push(dir);
        }
        if (s.outlier_count > 0) parts.push(`${s.outlier_count} outliers (${s.outlier_pct}%)`);
        if (parts.length > 0) insight = parts.join(" · ");
      }
      break;
    }

    // ── BOX ─────────────────────────────────────────────
    case "box": {
      if (chart.groups && Array.isArray(chart.groups)) {
        data = chart.groups.map((g, i) => ({
          type: "box",
          y: g.values,
          name: g.name,
          marker: { color: CHART_COLORS[i % CHART_COLORS.length] },
          boxmean: "sd",
        }));
        if (chart.groups.length > 1) layout.showlegend = true;
      } else if (chart.values) {
        data = [{
          type: "box",
          y: chart.values,
          name: chart.y_label || chart.x_label || "",
          marker: { color: CHART_COLORS[0] },
          boxmean: "sd",
        }];
      }

      if (chart.y_range) {
        layout.yaxis.range = chart.y_range;
      }

      // Build insight from stats
      if (chart.stats) {
        const s = chart.stats;
        const parts = [];
        if (s.median !== undefined) parts.push(`Median: ${Number(s.median).toLocaleString()}`);
        if (s.iqr !== undefined) parts.push(`IQR: ${Number(s.iqr).toLocaleString()}`);
        if (s.outlier_count > 0) parts.push(`${s.outlier_count} outliers (${s.outlier_pct}%)`);
        if (parts.length > 0) insight = parts.join(" · ");
      }
      break;
    }

    // ── HEATMAP ─────────────────────────────────────────
    case "heatmap": {
      const trace = {
        type: "heatmap",
        x: chart.x || [],
        y: chart.y || [],
        z: chart.z || [],
        colorscale: "YlOrRd",
        showscale: true,
        colorbar: {
          title: { text: chart.use_log_scale ? `log(${chart.z_label || "value"})` : (chart.z_label || ""), side: "right" },
          thickness: 15,
        },
      };
      if (chart.cell_annotations) {
        trace.text = chart.cell_annotations.map(row =>
          row.map(v => v !== null && v !== undefined ? Number(v).toLocaleString(undefined, { maximumFractionDigits: 1 }) : "")
        );
        trace.texttemplate = "%{text}";
        trace.hovertemplate = "%{x}<br>%{y}<br>Value: %{text}<extra></extra>";
      }
      data = [trace];
      layout.margin = { l: 80, r: 20, t: 40, b: 80 };
      if (chart.use_log_scale) {
        insight = "Color scale uses log normalization to handle extreme value differences.";
      }
      break;
    }

    // ── BUBBLE ──────────────────────────────────────────
    case "bubble": {
      const sizes = chart.sizes || [];
      const maxSize = sizes.length > 0 ? Math.max(...sizes.filter(v => v != null)) : 1;
      data = [{
        type: "scatter",
        mode: "markers",
        x: chart.x || [],
        y: chart.y || [],
        marker: {
          size: sizes.map(s => s != null ? Math.max(5, (s / maxSize) * 50) : 5),
          color: sizes,
          colorscale: "Portland",
          showscale: true,
          colorbar: { title: { text: chart.size_label || "" }, thickness: 12 },
          opacity: 0.7,
          line: { width: 1, color: "rgba(0,0,0,0.15)" },
        },
        text: sizes.map(s => s != null ? `Size: ${Number(s).toLocaleString()}` : ""),
        hovertemplate: `${chart.x_label || "x"}: %{x}<br>${chart.y_label || "y"}: %{y}<br>%{text}<extra></extra>`,
      }];
      break;
    }

    // ── FUNNEL ──────────────────────────────────────────
    case "funnel": {
      data = [{
        type: "funnel",
        y: chart.x || [],   // stage labels on y-axis
        x: chart.y || [],   // values on x-axis
        textinfo: "value+percent initial",
        marker: {
          color: CHART_COLORS.slice(0, (chart.x || []).length),
        },
        connector: { line: { color: "rgba(0,0,0,0.1)", width: 1 } },
      }];
      // Add conversion rate annotation
      if (chart.conversion_pcts) {
        const pcts = chart.conversion_pcts;
        const parts = [];
        for (let i = 1; i < pcts.length; i++) {
          if (pcts[i] != null) {
            parts.push(`${chart.x[i - 1]} → ${chart.x[i]}: ${pcts[i]}%`);
          }
        }
        if (parts.length > 0) insight = "Step conversion: " + parts.join(" | ");
      }
      break;
    }

    // ── TREEMAP ─────────────────────────────────────────
    case "treemap": {
      const labels = chart.labels || [];
      const values = chart.values || [];
      data = [{
        type: "treemap",
        labels: labels,
        parents: labels.map(() => ""),
        values: values,
        textinfo: "label+value+percent parent",
        marker: { colors: CHART_COLORS.slice(0, labels.length) },
      }];
      delete layout.xaxis;
      delete layout.yaxis;
      layout.margin = { l: 10, r: 10, t: 40, b: 10 };
      break;
    }

    // ── WATERFALL ───────────────────────────────────────
    case "waterfall": {
      const yVals = chart.y || [];
      // Plotly waterfall uses measure: "relative" for intermediate, "total" for last
      const measure = yVals.map((_, i) => i === yVals.length - 1 ? "total" : "relative");
      data = [{
        type: "waterfall",
        x: chart.x || [],
        y: yVals,
        measure: measure,
        connector: { line: { color: "rgba(0,0,0,0.2)", width: 1 } },
        increasing: { marker: { color: "#5B8A72" } },
        decreasing: { marker: { color: "#B85C45" } },
        totals: { marker: { color: "#6B7FA3" } },
      }];
      break;
    }

    // ── DEFAULT FALLTHROUGH ─────────────────────────────
    default: {
      if (chart.series && Array.isArray(chart.series)) {
        data = chart.series.map((s, i) => ({
          type: chartType === "area" ? "scatter" : (chartType === "line" ? "scatter" : chartType),
          mode: chartType === "line" ? "lines+markers" : (chartType === "area" ? "lines" : undefined),
          fill: chartType === "area" ? "tozeroy" : undefined,
          x: s.x,
          y: s.y,
          name: s.name,
          marker: { color: CHART_COLORS[i % CHART_COLORS.length] },
        }));
        layout.showlegend = true;
      } else {
        data = [{
          type: "bar",
          x: chart.x || [],
          y: chart.y || [],
          marker: { color: CHART_COLORS[0] },
        }];
      }
    }
  }

  // Add fallback reason as insight
  if (chart.fallback_reason) {
    insight = chart.fallback_reason;
  }
  // Preserve any existing insight from backend
  if (chart.insight) {
    insight = chart.insight;
  }

  return { data, layout, insight };
}

/**
 * Batch-converts an array of backend charts to Plotly format.
 * Filters out null results.
 */
export function convertAllCharts(charts) {
  if (!Array.isArray(charts)) return [];
  return charts.map(convertChartToPlotly).filter(Boolean);
}
