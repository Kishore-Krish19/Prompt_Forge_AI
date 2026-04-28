from llm.groq_llm import GroqLLM
from llm.huggingface_llm import HuggingFaceLLM
from llm.gemini_llm import GeminiLLM
from utils.config import GROQ_API_KEY, HF_API_KEY, GEMINI_API_KEY


def get_llm(provider: str):
    """
    Returns the corresponding LLM client instance based on the provider name.
    """
    provider = provider.lower().strip()
    
    if provider == "groq":
        return GroqLLM(api_key=GROQ_API_KEY)
        
    elif provider == "huggingface":
        return HuggingFaceLLM(api_key=HF_API_KEY)
        
    elif provider == "gemini":
        return GeminiLLM(api_key=GEMINI_API_KEY)
        
    else:
        raise ValueError(f"Unsupported model provider: {provider}")

