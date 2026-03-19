import os
import logging
from dotenv import load_dotenv
from groq import Groq
import google.generativeai as genai
from huggingface_hub import InferenceClient

# Setup logging to file
logging.basicConfig(
    filename='diag_output.txt',
    level=logging.INFO,
    format='%(levelname)s: %(message)s',
    filemode='w'
)
logger = logging.getLogger(__name__)

load_dotenv()

def test_groq():
    logger.info("--- Testing Groq ---")
    key = os.getenv("GROQ_API_KEY")
    if not key:
        logger.error("GROQ_API_KEY is missing")
        return
    logger.info(f"GROQ_API_KEY: {key[:4]}...{key[-4:] if len(key) > 4 else ''}")
    
    # Try model llama3-70b-8192
    try:
        client = Groq(api_key=key)
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{"role": "user", "content": "Hello"}],
        )
        logger.info(f"Groq Success with llama3-70b-8192: {response.choices[0].message.content[:50]}")
    except Exception as e:
        logger.error(f"Groq Failed with llama3-70b-8192: {e}")
        
    # Try model llama3-8b-8192
    try:
        client = Groq(api_key=key)
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": "Hello"}],
        )
        logger.info(f"Groq Success with llama3-8b-8192: {response.choices[0].message.content[:50]}")
    except Exception as e:
        logger.error(f"Groq Failed with llama3-8b-8192: {e}")

def test_gemini():
    logger.info("--- Testing Gemini ---")
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        logger.error("GEMINI_API_KEY is missing")
        return
    logger.info(f"GEMINI_API_KEY: {key[:4]}...{key[-4:] if len(key) > 4 else ''}")
    
    try:
        genai.configure(api_key=key)
        # Try gemini-1.5-flash
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content("Hello")
        logger.info(f"Gemini Success with gemini-2.5-flash: {response.text[:50]}")
    except Exception as e:
        logger.error(f"Gemini Failed with gemini-2.5-flash: {e}")
        
    try:
        # Try gemini-pro
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content("Hello")
        logger.info(f"Gemini Success with gemini-2.5-flash: {response.text[:50]}")
    except Exception as e:
        logger.error(f"Gemini Failed with gemini-2.5-flash: {e}")

def test_huggingface():
    logger.info("--- Testing Hugging Face ---")
    key = os.getenv("HUGGINGFACE_API_KEY")
    if not key:
        logger.error("HUGGINGFACE_API_KEY is missing")
        return
        
    logger.info(f"HUGGINGFACE_API_KEY: {key[:4]}...{key[-4:] if len(key) > 4 else ''}")
    try:
        client = InferenceClient(api_key=key)
        # Using chat.completions.create API for compatibility Testing
        response = client.chat.completions.create(
            model="Qwen/Qwen3.5-35B-A3B",
            messages=[{"role": "user", "content": "Hello"}],
            max_tokens=64
        )
        logger.info(f"Hugging Face Success: {response.choices[0].message.content[:50]}")
    except Exception as e:
        logger.error(f"Hugging Face Failed: {e}")

if __name__ == "__main__":
    test_groq()
    test_gemini()
    test_huggingface()
