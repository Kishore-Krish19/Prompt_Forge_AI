import os
import logging
from dotenv import load_dotenv
from groq import Groq
import google.generativeai as genai

# Setup logging to file
logging.basicConfig(
    filename='list_models_output.txt',
    level=logging.INFO,
    format='%(levelname)s: %(message)s',
    filemode='w'
)
logger = logging.getLogger(__name__)

load_dotenv()

def list_groq_models():
    logger.info("--- Listing Groq Models ---")
    key = os.getenv("GROQ_API_KEY")
    if not key:
        logger.error("GROQ_API_KEY is missing")
        return
    try:
        client = Groq(api_key=key)
        models = client.models.list()
        # models is an object, let's see its structure or items
        # Usually models.data contains the list
        for model in getattr(models, 'data', []):
            logger.info(f"Groq Model: id={model.id}, owned_by={model.owned_by if hasattr(model, 'owned_by') else 'unknown'}")
        if not hasattr(models, 'data'):
            logger.info(f"Models response: {models}")
    except Exception as e:
        logger.error(f"Failed to list Groq models: {e}")

def list_gemini_models():
    logger.info("--- Listing Gemini Models ---")
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        logger.error("GEMINI_API_KEY is missing")
        return
    try:
        genai.configure(api_key=key)
        models = genai.list_models()
        for m in models:
            logger.info(f"Gemini Model: name={m.name}, supported_methods={m.supported_generation_methods}")
    except Exception as e:
        logger.error(f"Failed to list Gemini models: {e}")

if __name__ == "__main__":
    list_groq_models()
    list_gemini_models()
