import os
import logging
from dotenv import load_dotenv
from services.agent_orchestrator import AgentOrchestrator

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

def verify_optimize():
    orchestrator = AgentOrchestrator()
    try:
        # Call optimize
        optimized, provider = orchestrator.optimize(
            prompt="Make a weather app website", 
            requirements={"style": "modern", "tech": "React"},
            provider="groq"
        )
        print("\n--- Verification Success ---")
        print("Optimized Prompt (First 100 chars):", optimized[:100])
        print("Provider Used:", provider)
    except Exception as e:
        print("\n--- Verification Error ---")
        print("Error during optimize:", e)

if __name__ == "__main__":
    verify_optimize()
