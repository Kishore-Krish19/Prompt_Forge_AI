import logging
from dotenv import load_dotenv
import json
from benchmark.prompt_benchmark import run_benchmark

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

def verify_benchmark():
    logger.info("--- Starting Benchmark Verification ---")
    
    user_prompt = "Write a short creative story about a robot learning to paint."
    requirements = {
        "style": "creative",
        "length": "short",
        "topic": "robot painting"
    }
    
    try:
        # Run benchmark with default provider (groq for variant generation)
        results = run_benchmark(user_prompt, requirements, provider="groq")
        print("\n=== Benchmark Results ===")
        print(json.dumps(results, indent=2))
        logger.info("Benchmark executed successfully.")
    except Exception as e:
        logger.error(f"Benchmark failed: {e}")

if __name__ == "__main__":
    verify_benchmark()
