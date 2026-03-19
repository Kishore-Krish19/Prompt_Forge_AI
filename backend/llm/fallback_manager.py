import logging
from llm.llm_factory import get_llm

logger = logging.getLogger(__name__)

def generate_with_fallback(prompt: str, provider: str, **kwargs) -> dict:
    """
    Attempts to generate a response using the prioritizing provider, 
    falling back to remaining available nodes if failing providers raised streams.
    """
    providers = [provider, "groq", "gemini", "huggingface"]
    
    # Remove duplicates while keeping ordering priority
    unique_providers = []
    for p in providers:
        if p not in unique_providers:
            unique_providers.append(p)
            
    logger.info(f"Starting fallback chain. Initial Provider: {provider}")
    
    for p in unique_providers:
        try:
            logger.info(f"Trying provider: {p}")
            llm = get_llm(p)
            response = llm.generate(prompt, **kwargs)
            logger.info(f"Provider succeeded: {p}")
            return {
                "provider_used": p,
                "response": response
            }
        except Exception as e:
            logger.warning(f"Provider failed ({p}): {str(e)}")
            continue
            
    raise RuntimeError("All AI providers failed. Please check your API keys inside `.env` thresholds.")
