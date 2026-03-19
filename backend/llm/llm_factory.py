import os
from dotenv import load_dotenv

# Import Models
from llm.groq_llm import GroqLLM
from llm.huggingface_llm import HuggingFaceLLM
from llm.gemini_llm import GeminiLLM

load_dotenv()

def get_llm(provider: str):
    """
    Returns the corresponding LLM client instance based on the provider name.
    """
    provider = provider.lower().strip()
    
    if provider == "groq":
        key = os.getenv("GROQ_API_KEY", "your_api_key_here")
        return GroqLLM(api_key=key)
        
    elif provider == "huggingface":
        key = os.getenv("HUGGINGFACE_API_KEY", "your_api_key_here")
        return HuggingFaceLLM(api_key=key)
        
    elif provider == "gemini":
        key = os.getenv("GEMINI_API_KEY", "your_api_key_here")
        return GeminiLLM(api_key=key)
        
    else:
        raise ValueError(f"Unsupported model provider: {provider}")

