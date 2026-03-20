from pydantic import BaseModel
from typing import List, Dict

# --- /analyze Endpoint ---
class AnalyzeRequest(BaseModel):
    prompt: str
    model: str = "groq"

class AnalyzeResponse(BaseModel):
    intent: str
    questions: List[str]
    provider_used: str = "groq"

# --- /optimize Endpoint ---
class OptimizeRequest(BaseModel):
    prompt: str
    requirements: Dict[str, str]
    model: str = "groq"

class OptimizeResponse(BaseModel):
    optimized_prompt: str
    provider_used: str = "groq"

# --- /score Endpoint ---
class ScoreRequest(BaseModel):
    prompt: str
    model: str = "groq"

class ScoreAnalysis(BaseModel):
    clarity: int
    specificity: int
    context: int
    constraints: int
    output_format: int

class ScoreResponse(BaseModel):
    score: float
    analysis: ScoreAnalysis
    suggestions: List[str]
    provider_used: str = "groq"

# --- /benchmark Endpoint ---
class BenchmarkRequest(BaseModel):
    prompt: str
    requirements: Dict[str, str]
    model: str = "groq"

class Variant(BaseModel):
    provider: str
    prompt: str
    score: float

class BenchmarkResponse(BaseModel):
    best_prompt: str
    benchmark_results: Dict[str, float]
    best_prompt_index: int
    variants: List[Variant] = []

class AnalyticsData(BaseModel):
    original: int
    optimized: int

class ModelPerformance(BaseModel):
    groq: float
    gemini: float
    huggingface: float


class AnalyticsResponse(BaseModel):
    prompt_improvement: AnalyticsData
    model_performance: ModelPerformance
    benchmark_results: Dict[str, float]
