import os
import logging
from dotenv import load_dotenv
from llm.fallback_manager import generate_with_fallback

# Setup logging to file
logging.basicConfig(
    filename='verify_output.txt',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filemode='w'
)
logger = logging.getLogger(__name__)

load_dotenv()

def verify_fallback():
    logger.info("--- Starting Verification ---")
    
    # Test Groq
    try:
        logger.info("Testing Fallback starting with Groq")
        result = generate_with_fallback(prompt="Explain quantum computing in 1 sentence.", provider="groq")
        logger.info(f"Groq Success: {result}")
    except Exception as e:
        logger.error(f"Groq Fallback Failed: {e}")

    # Test Gemini
    try:
        logger.info("Testing Fallback starting with Gemini")
        result = generate_with_fallback(prompt="Explain quantum computing in 1 sentence.", provider="gemini")
        logger.info(f"Gemini Success: {result}")
    except Exception as e:
        logger.error(f"Gemini Fallback Failed: {e}")

    # Test Hugging Face (should fail if key invalid, but test the flow)
    try:
        logger.info("Testing Fallback starting with Hugging Face")
        result = generate_with_fallback(prompt="Explain quantum computing in 1 sentence.", provider="huggingface")
        logger.info(f"Hugging Face Success (Fallback worked): {result}")
    except Exception as e:
        logger.error(f"Hugging Face Fallback Failed: {e}")


if __name__ == "__main__":
    verify_fallback()
