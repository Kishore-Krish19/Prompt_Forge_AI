from dotenv import load_dotenv
import os

load_dotenv()

import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import uvicorn
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

# Auth and DB
from auth.db import init_db, ensure_indexes
from auth.routes import router as auth_router
from auth.admin_routes import router as admin_router
from auth.middleware import get_current_user
from auth.usage_middleware import usage_middleware
from auth.usage_service import track_usage
from auth.usage_routes import router as usage_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Models
from models.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    OptimizeRequest,
    OptimizeResponse,
    ScoreRequest,
    ScoreResponse,
    ScoreAnalysis,
    BenchmarkRequest,
    BenchmarkResponse,
)

# Services / Orchestration
from services.agent_orchestrator import AgentOrchestrator
from benchmark.prompt_benchmark import run_benchmark

app = FastAPI(title="PromptForge AI Multi-Agent Backend", version="1.1.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://prompt-forge-ai-nu.vercel.app",  # Your Vercel frontend
        "http://localhost:5173",  # Local Vite (adjust port if needed)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB and include auth routes
init_db()
import asyncio

try:
    asyncio.run(ensure_indexes())
except Exception:
    # best-effort indexing; don't block startup
    pass
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(usage_router)

# Usage tracking middleware - increments user provider counts after AI calls
app.middleware("http")(usage_middleware)

# Instantiate Orchestrator
orchestrator = AgentOrchestrator()


@app.get("/")
def read_root():
    return {"status": "PromptForge AI Multi-Agent Backend is running"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_prompt(body: AnalyzeRequest, req: Request):
    try:
        import time

        start = time.perf_counter()
        # MODIFY THIS LINE: unpack token_usage from orchestrator.
        intent, questions, provider_used, token_usage = orchestrator.analyze(
            body.prompt, body.model
        )
        elapsed_ms = int((time.perf_counter() - start) * 1000)

        # Debug logs
        logger.info("API HIT: /analyze")
        logger.info(f"MODEL USED: {provider_used}")

        # Perform tracking only after successful response and await completion
        user_email = getattr(req.state, "user_email", None)
        if user_email and provider_used:
            try:
                # Normalize provider_used -> model key
                pu = str(provider_used or "").lower()
                if "groq" in pu:
                    model_key = "groq"
                elif "gemini" in pu:
                    model_key = "gemini"
                elif "qwen" in pu or "huggingface" in pu:
                    model_key = "qwen"
                elif "gpt" in pu:
                    model_key = "gpt"
                elif "claude" in pu:
                    model_key = "claude"
                else:
                    model_key = pu or "unknown"

                logger.info(f"Mapped model: {model_key}")
                logger.info(f"Attempting to update usage for user email: {user_email}")
                # MODIFY THIS LINE: pass token_usage to tracking.
                result = await track_usage(
                    user_email,
                    model_key,
                    tokens=token_usage,
                    endpoint="analyze",
                    response_time_ms=elapsed_ms,
                )
                user_id = result.get("user_id")
                logger.info(f"USER ID: {user_id}")
                logger.info("Updating usage...")
                logger.info(f"Insert result: {result.get('insert_result')}")
                logger.info(f"Update result: {result.get('update_result')}")
            except Exception:
                logger.exception("Failed to track usage for /analyze")

        return AnalyzeResponse(
            intent=intent, questions=questions, provider_used=provider_used
        )
    except Exception as e:
        logger.error(f"Analyze error: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Selected AI model failed: {str(e)}"
        )


@app.post("/optimize", response_model=OptimizeResponse)
async def optimize_user_prompt(body: OptimizeRequest, req: Request):
    try:
        import time

        start = time.perf_counter()
        # MODIFY THIS LINE: unpack token_usage from orchestrator.
        optimized, provider_used, token_usage = orchestrator.optimize(
            body.prompt, body.requirements, body.model
        )
        elapsed_ms = int((time.perf_counter() - start) * 1000)

        logger.info("API HIT: /optimize")
        logger.info(f"MODEL USED: {provider_used}")
        user_email = getattr(req.state, "user_email", None)
        if user_email and provider_used:
            try:
                pu = str(provider_used or "").lower()
                if "groq" in pu:
                    model_key = "groq"
                elif "gemini" in pu:
                    model_key = "gemini"
                elif "qwen" in pu or "huggingface" in pu:
                    model_key = "qwen"
                elif "gpt" in pu:
                    model_key = "gpt"
                elif "claude" in pu:
                    model_key = "claude"
                else:
                    model_key = pu or "unknown"

                logger.info(f"Mapped model: {model_key}")
                logger.info(f"Attempting to update usage for user email: {user_email}")
                # MODIFY THIS LINE: pass token_usage to tracking.
                result = await track_usage(
                    user_email,
                    model_key,
                    tokens=token_usage,
                    endpoint="optimize",
                    response_time_ms=elapsed_ms,
                )
                user_id = result.get("user_id")
                logger.info(f"USER ID: {user_id}")
                logger.info("Updating usage...")
                logger.info(f"Insert result: {result.get('insert_result')}")
                logger.info(f"Update result: {result.get('update_result')}")
            except Exception:
                logger.exception("Failed to track usage for /optimize")

        return OptimizeResponse(optimized_prompt=optimized, provider_used=provider_used)
    except Exception as e:
        logger.error(f"Optimize error: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Selected AI model failed: {str(e)}"
        )


@app.post("/score", response_model=ScoreResponse)
async def score_user_prompt(body: ScoreRequest, req: Request):
    try:
        import time

        start = time.perf_counter()
        # MODIFY THIS LINE: unpack token_usage from orchestrator.
        rating, breakdown, suggestions, provider_used, token_usage = orchestrator.score(
            body.prompt, body.model
        )
        elapsed_ms = int((time.perf_counter() - start) * 1000)

        analysis = ScoreAnalysis(
            clarity=breakdown["clarity"],
            specificity=breakdown["specificity"],
            context=breakdown["context"],
            constraints=breakdown["constraints"],
            output_format=breakdown["output_format"],
        )

        logger.info("API HIT: /score")
        logger.info(f"MODEL USED: {provider_used}")
        user_email = getattr(req.state, "user_email", None)
        if user_email and provider_used:
            try:
                pu = str(provider_used or "").lower()
                if "groq" in pu:
                    model_key = "groq"
                elif "gemini" in pu:
                    model_key = "gemini"
                elif "qwen" in pu or "huggingface" in pu:
                    model_key = "qwen"
                elif "gpt" in pu:
                    model_key = "gpt"
                elif "claude" in pu:
                    model_key = "claude"
                else:
                    model_key = pu or "unknown"

                logger.info(f"Mapped model: {model_key}")
                logger.info(f"Attempting to update usage for user email: {user_email}")
                # MODIFY THIS LINE: pass token_usage to tracking.
                result = await track_usage(
                    user_email,
                    model_key,
                    tokens=token_usage,
                    endpoint="score",
                    response_time_ms=elapsed_ms,
                )
                user_id = result.get("user_id")
                logger.info(f"USER ID: {user_id}")
                logger.info("Updating usage...")
                logger.info(f"Insert result: {result.get('insert_result')}")
                logger.info(f"Update result: {result.get('update_result')}")
            except Exception:
                logger.exception("Failed to track usage for /score")

        return ScoreResponse(
            score=rating,
            analysis=analysis,
            suggestions=suggestions,
            provider_used=provider_used,
        )
    except Exception as e:
        logger.error(f"Score error: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Selected AI model failed: {str(e)}"
        )


@app.post("/benchmark", response_model=BenchmarkResponse)
async def benchmark_prompt(body: BenchmarkRequest, req: Request):
    logger.info(f"BENCHMARK ENDPOINT called for prompt: '{body.prompt}'")
    try:
        import time

        start = time.perf_counter()
        results = run_benchmark(body.prompt, body.requirements, body.model)
        elapsed_ms = int((time.perf_counter() - start) * 1000)

        user_email = getattr(req.state, "user_email", None)
        provider_used = (
            results.get("provider_used") if isinstance(results, dict) else body.model
        )
        logger.info("API HIT: /benchmark")
        logger.info(f"MODEL USED: {provider_used}")
        if user_email and provider_used:
            try:
                pu = str(provider_used or "").lower()
                if "groq" in pu:
                    model_key = "groq"
                elif "gemini" in pu:
                    model_key = "gemini"
                elif "qwen" in pu or "huggingface" in pu:
                    model_key = "qwen"
                elif "gpt" in pu:
                    model_key = "gpt"
                elif "claude" in pu:
                    model_key = "claude"
                else:
                    model_key = pu or "unknown"

                logger.info(f"Mapped model: {model_key}")
                logger.info(f"Attempting to update usage for user email: {user_email}")
                result = await track_usage(
                    user_email,
                    model_key,
                    tokens=0,
                    endpoint="benchmark",
                    response_time_ms=elapsed_ms,
                )
                user_id = result.get("user_id")
                logger.info(f"USER ID: {user_id}")
                logger.info("Updating usage...")
                logger.info(f"Insert result: {result.get('insert_result')}")
                logger.info(f"Update result: {result.get('update_result')}")
            except Exception:
                logger.exception("Failed to track usage for /benchmark")

        return BenchmarkResponse(
            best_prompt=results["best_prompt"],
            benchmark_results=results["benchmark_results"],
            best_prompt_index=results["best_prompt_index"],
            variants=results["variants"],
        )
    except Exception as e:
        logger.error(f"Benchmark error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Benchmark failed: {str(e)}")


@app.get("/health")
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
