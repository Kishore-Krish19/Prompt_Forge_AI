import os
import logging
from openai import OpenAI
from llm.base_llm import BaseLLM

logger = logging.getLogger(__name__)

class OpenAILLM(BaseLLM):
    def __init__(self, api_key: str):
        self.api_key = api_key
        if api_key:
            masked = api_key[:4] + "..." + (api_key[-4:] if len(api_key) > 4 else "")
            logger.info(f"[OpenAI] API Key provided: {masked}")
            
        if not api_key or api_key == "your_api_key_here":
            logger.warning("[OpenAI] API key is missing or is dummy placeholder.")
            self.client = None
        else:
            self.client = OpenAI(api_key=api_key)

    def generate(self, prompt: str) -> str:
        if not self.client:
            # Task 5: Skip provider with warning
            raise RuntimeError("OpenAI API key is missing or invalid. Skipping provider.")
            
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "You are an expert prompt engineer."},
                {"role": "user", "content": prompt}
            ]
        }
        
        # Debug Logging: Request Payload
        logger.info(f"[OpenAI] Request Payload: {payload}")
        
        try:
            response = self.client.chat.completions.create(**payload)
            logger.info("[OpenAI] Response received successfully.")
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"[OpenAI] API Error: {str(e)}")
            raise RuntimeError(
                f"OpenAI API call failed: {str(e)}"
            )

    def _simulate_response(self, prompt: str) -> str:
        # standard fallback logics
        import random
        return f"OpenAI SIMULATION: Optimized prompt response layout metrics."
