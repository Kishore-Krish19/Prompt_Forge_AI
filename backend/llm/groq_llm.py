import os
import logging
from groq import Groq
from llm.base_llm import BaseLLM

logger = logging.getLogger(__name__)

class GroqLLM(BaseLLM):
    def __init__(self, api_key: str):
        self.api_key = api_key
        if api_key:
            masked = api_key[:4] + "..." + (api_key[-4:] if len(api_key) > 4 else "")
            logger.info(f"[Groq] API Key provided: {masked}")
        
        if not api_key or api_key == "your_api_key_here":
            logger.warning("[Groq] API key is missing or is dummy placeholder.")
            self.client = None
        else:
            # Task 3: Use correct base URL (SDK default is correct)
            self.client = Groq(api_key=api_key)

    def generate(self, prompt: str) -> str:
        if not self.client:
            # Task 5: Skip provider with warning
            raise RuntimeError("Groq API key is missing or invalid. Skipping provider.")
            
        # Update Model to llama-3.3-70b-versatile
        model_name = "llama-3.3-70b-versatile"
        
        payload = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": "You are an expert prompt engineer."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3
        }
        
        # Debug Logging: Request Payload
        logger.info(f"[Groq] Request Payload: {payload}")
        
        try:
            completion = self.client.chat.completions.create(**payload)
            logger.info("[Groq] Response received successfully.")
            return completion.choices[0].message.content
        except Exception as e:
            # Debug Logging: Error Body
            logger.error(f"[Groq] API Error: {str(e)}")
            raise RuntimeError(
                f"Groq API call failed: {str(e)}"
            )

    def _simulate_response(self, prompt: str) -> str:
        import random
        prompt_lower = prompt.lower()
        if "classify" in prompt_lower or "category" in prompt_lower:
            return random.choice(["coding", "writing", "design", "research"])
        if "questions" in prompt_lower or "clarification" in prompt_lower:
            return '["What is the target AI Model?", "What is the preferred format?"]'
        if "evaluate" in prompt_lower or "score" in prompt_lower:
            return '{"score": 85, "suggestions": ["Be more specific on tech stack"]}'
        return "# Role\nExpert AI\n\n# Task\nComplete job\n\n# Requirements\n- Accurate\n# Constraints\n- High quality"
