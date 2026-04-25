import logging
logger = logging.getLogger(__name__)
import pandas as pd
from app.pipeline.transformer import DataTransformer

# ─────────────────────────────────────────────
# CHART BUILDER
# ─────────────────────────────────────────────

class ChartBuilder:
    def __init__(self, transformer: DataTransformer):
        self._transformer = transformer

    def build(self, cfg: dict) -> dict | None:
        try:
            df = self._transformer.transform(cfg)
            if df.empty:
                return None

            chart_type = cfg["type"]
            x, y       = cfg["x"], cfg["y"]
            color      = cfg["color"]

            if chart_type == "histogram":
                return {
                    "data": [{
                        "type": "histogram",
                        "x": df[x].tolist(),
                        "name": x,
                        "marker": {"color": "#c96442"}
                    }],
                    "layout": {
                        "title": cfg["title"],
                        "xaxis": {"title": x},
                        "yaxis": {"title": "Count"}
                    },
                    "insight": cfg.get("insight"),
                    "layout_size": cfg["layout_size"],
                }

            if chart_type == "pie":
                return {
                    "data": [{
                        "type": "pie",
                        "labels": df[x].tolist(),
                        "values": df[y].tolist(),
                        "textinfo": "label+percent",
                        "hole": 0.4
                    }],
                    "layout": {
                        "title": cfg["title"]
                    },
                    "insight": cfg.get("insight"),
                    "layout_size": cfg["layout_size"],
                }

            if color and color in df.columns:
                return self._multi_series(df, cfg)

            if chart_type == "scatter" and (df[x].nunique() < 5 or df[y].nunique() < 5):
                return None

            return {
                "data": [{
                    "type": chart_type,
                    "x": df[x].tolist(),
                    "y": df[y].tolist(),
                    "name": y,
                    "marker": {"color": "#c96442"}
                }],
                "layout": {
                    "title": cfg["title"],
                    "xaxis": {"title": x},
                    "yaxis": {"title": y}
                },
                "insight": cfg.get("insight"),
                "layout_size": cfg["layout_size"],
            }

        except Exception as exc:
            logger.error("Chart build failed for %r: %s", cfg.get("title"), exc)
            return None

    @staticmethod
    def _multi_series(df: pd.DataFrame, cfg: dict) -> dict:
        x, y, color = cfg["x"], cfg["y"], cfg["color"]
        return {
            "data": [
                {
                    "type": cfg["type"],
                    "name": str(n),
                    "x": g[x].tolist(),
                    "y": g[y].tolist()
                }
                for n, g in df.groupby(color)
            ],
            "layout": {
                "title": cfg["title"],
                "xaxis": {"title": x},
                "yaxis": {"title": y}
            },
            "insight": cfg.get("insight"),
            "layout_size": cfg["layout_size"],
        }
