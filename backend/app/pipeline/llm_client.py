import json
import os
import re
import logging
logger = logging.getLogger(__name__)
from openai import AsyncOpenAI
from dotenv import load_dotenv
load_dotenv()
from pydantic import ValidationError

from app.schemas.chart_schema import LLMResponseSchema

SYSTEM_PROMPT = """
You are a senior data scientist and visualization expert.
Return ONLY valid JSON — no explanation, no markdown fences.

OUTPUT FORMAT:
{
  "charts": [
    {
      "type": "bar | line | scatter | histogram | pie",
      "x": "column_name",
      "y": "column_name or null",
      "color": "column_name or null",
      "aggregation": "sum | mean | count | none",
      "time_granularity": "day | week | month | year | none",
      "layout_size": "small | medium | large",
      "title": "clear descriptive title",
      "insight": "One sentence describing the key trend or anomaly shown here."
    }
  ],
  "tables": []
}

CHART RULES:
1. MANDATORY: Return at least 4-6 diverse charts for any general analysis. 
2. Use EXACT column names provided. Do not invent new columns.
3. Priority: line charts for time-series, bars for categories, pies ONLY for <6 categories.
4. If a date column exists, ALWAYS include at least one line chart.
5. Provide meaningful 'insight' for every chart. This is critical for the user.

TABLE RULES:
1. Max 2 tables. Only for complex data that charts can't handle.
"""

REPAIR_PROMPT = """
The JSON you returned failed schema validation.
Error: {error}
Original response: {original}
Fix it and return ONLY valid JSON using available columns: {columns}
"""

def _strip_fences(text: str) -> str:
    return re.sub(r"```(?:json)?", "", text).replace("```", "").strip()

def _parse_and_validate(raw: str) -> LLMResponseSchema:
    data = json.loads(_strip_fences(raw))
    return LLMResponseSchema.model_validate(data)

class LLMClient:
    MAX_RETRIES = 2
    MAX_REPAIRS = 1

    def __init__(self):
        self._client = AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
        )

    async def get_chart_config(
        self, col_dt_list: list, sample: str, stats: str, query: str
    ) -> LLMResponseSchema:
        user_msg = f"Columns: {col_dt_list}\n\nSample:\n{sample}\n\nStats:\n{stats}\n\nQuery:\n{query}"
        last_raw = ""
        last_error = ""

        for attempt in range(1, self.MAX_RETRIES + 1):
            try:
                last_raw = await self._call([
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_msg},
                ])
                return _parse_and_validate(last_raw)
            except Exception as exc:
                last_error = str(exc)
                logger.warning(f"LLM attempt {attempt} failed: {last_error}")

        columns = [col for col, _ in col_dt_list]
        for rep in range(1, self.MAX_REPAIRS + 1):
            try:
                repair_msg = REPAIR_PROMPT.format(error=last_error, original=last_raw, columns=columns)
                last_raw = await self._call([
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_msg},
                    {"role": "assistant", "content": last_raw},
                    {"role": "user", "content": repair_msg},
                ])
                return _parse_and_validate(last_raw)
            except Exception as exc:
                logger.warning(f"Repair {rep} failed: {str(exc)}")

        return self._fallback_config(col_dt_list)

    async def _call(self, messages: list) -> str:
        # Using a set of highly capable models for complex charting logic
        models = [
            "qwen/qwen-2.5-72b-instruct:free",
            "meta-llama/llama-3.3-70b-instruct:free",
            "nvidia/nemotron-3-super-120b-a12b:free",
            "google/gemini-2.0-flash-exp:free"
        ]
        
        last_exception = None
        for model in models:
            try:
                response = await self._client.chat.completions.create(
                    model=model,
                    messages=messages,
                    timeout=60
                )
                return response.choices[0].message.content
            except Exception as e:
                last_exception = e
                if any(x in str(e).lower() for x in ["503", "429", "402", "404", "upstream", "timeout", "not found", "no endpoints"]):
                    continue
                raise e
        raise last_exception

    @staticmethod
    def _fallback_config(col_dt_list: list) -> LLMResponseSchema:
        cols = {col: str(dt) for col, dt in col_dt_list}
        num_cols = [c for c, dt in cols.items() if "int" in dt or "float" in dt]
        if num_cols:
            raw = [{"type": "histogram", "x": num_cols[0], "y": None, "aggregation": "none", "layout_size": "medium", "title": f"Distribution of {num_cols[0]}", "insight": "Automatic distribution analysis."}]
        else:
            raw = [{"type": "histogram", "x": list(cols.keys())[0], "y": None, "aggregation": "none", "layout_size": "medium", "title": "Data Overview", "insight": "Basic data distribution."}]
        return LLMResponseSchema.model_validate({"charts": raw, "tables": []})