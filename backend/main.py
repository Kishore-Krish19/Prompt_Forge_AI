import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import uvicorn
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Models
from models.schemas import (
    AnalyzeRequest, AnalyzeResponse,
    OptimizeRequest, OptimizeResponse,
    ScoreRequest, ScoreResponse, ScoreAnalysis,
    BenchmarkRequest, BenchmarkResponse
)

# Services / Orchestration
from services.agent_orchestrator import AgentOrchestrator
from benchmark.prompt_benchmark import run_benchmark

app = FastAPI(title="PromptForge AI Multi-Agent Backend", version="1.1.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instantiate Orchestrator
orchestrator = AgentOrchestrator()

@app.get("/")
def read_root():
    return {"status": "PromptForge AI Multi-Agent Backend is running"}

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_prompt(request: AnalyzeRequest):
    try:
        intent, questions, provider_used = orchestrator.analyze(request.prompt, request.model)
        return AnalyzeResponse(intent=intent, questions=questions, provider_used=provider_used)
    except Exception as e:
        logger.error(f"Analyze error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Selected AI model failed: {str(e)}"
        )

@app.post("/optimize", response_model=OptimizeResponse)
def optimize_user_prompt(request: OptimizeRequest):
    try:
        optimized, provider_used = orchestrator.optimize(request.prompt, request.requirements, request.model)
        return OptimizeResponse(optimized_prompt=optimized, provider_used=provider_used)
    except Exception as e:
        logger.error(f"Optimize error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Selected AI model failed: {str(e)}"
        )

@app.post("/score", response_model=ScoreResponse)
def score_user_prompt(request: ScoreRequest):
    try:
        rating, breakdown, suggestions, provider_used = orchestrator.score(request.prompt, request.model)
        
        analysis = ScoreAnalysis(
            clarity=breakdown["clarity"],
            specificity=breakdown["specificity"],
            context=breakdown["context"],
            constraints=breakdown["constraints"],
            output_format=breakdown["output_format"]
        )
        
        return ScoreResponse(score=rating, analysis=analysis, suggestions=suggestions, provider_used=provider_used)
    except Exception as e:
        logger.error(f"Score error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Selected AI model failed: {str(e)}"
        )

@app.post("/benchmark", response_model=BenchmarkResponse)
def benchmark_prompt(request: BenchmarkRequest):
    logger.info(f"BENCHMARK ENDPOINT called for prompt: '{request.prompt}'")
    try:
        results = run_benchmark(request.prompt, request.requirements, request.model)
        return BenchmarkResponse(
            best_prompt=results["best_prompt"],
            benchmark_results=results["benchmark_results"],
            best_prompt_index=results["best_prompt_index"],
            variants=results["variants"]
        )
    except Exception as e:
        logger.error(f"Benchmark error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Benchmark failed: {str(e)}"
        )

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
