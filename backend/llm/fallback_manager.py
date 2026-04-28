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
            # ADD THIS HERE: collect per-call token usage exposed by provider client.
            token_usage = int(getattr(llm, "last_token_usage", 0) or 0)
            logger.info(f"Provider succeeded: {p}")
            return {
                "provider_used": p,
                "response": response,
                "token_usage": token_usage
            }
        except Exception as e:
            logger.warning(f"Provider failed ({p}): {str(e)}")
            continue
            
    logger.error("All AI providers failed. Returning graceful mock response to prevent application crash.")
    
    prompt_lower = prompt.lower()
    
    if "json" in prompt_lower and "score" in prompt_lower:
        if "strengths" in prompt_lower:
             mock_response = '{"score": 8, "strengths": "Clear structure", "weaknesses": "Could be longer", "improvements": "Add examples"}'
        elif "clarity" in prompt_lower:
             mock_response = '{"score": 8, "clarity": 8, "specificity": 7, "context": 9, "constraints": 8, "output_format": 8}'
        elif "best_response" in prompt_lower:
             mock_response = '{"best_response": 1, "reason": "Accurate and robust"}'
        else:
             mock_response = '{"score": 7}'
    elif "question" in prompt_lower and "list" in prompt_lower:
        mock_response = '["Who is the target audience?", "What is the primary action expected?", "Are there specific boundaries?"]'
    elif "json" in prompt_lower:
        mock_response = '{"suggestions": ["Make it more specific", "Add persona context"]}'
    else:
        if "conciseness" in prompt_lower:
             mock_response = "Mock Optimized Prompt (Groq Style):\n- Clear objective\n- Efficient delivery\n- Highly structured"
        elif "creative" in prompt_lower:
             mock_response = "Mock Optimized Prompt (HuggingFace Style):\nImagine a highly detailed scenario where every creative aspect is elaborated beautifully and expansively..."
        elif "analytical" in prompt_lower:
             mock_response = "Mock Optimized Prompt (Gemini Style):\n1. Primary Analysis\n2. Sequential Steps\n3. Logical Conclusions"
        else:
             mock_response = "You are an AI assistant. Please complete the user's task clearly and effectively."

    return {
        "provider_used": "mock_fallback_ai",
        "response": mock_response,
        "token_usage": 0
    }
