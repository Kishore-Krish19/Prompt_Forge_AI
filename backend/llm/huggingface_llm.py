import os
import logging
from huggingface_hub import InferenceClient
from llm.base_llm import BaseLLM

logger = logging.getLogger(__name__)

class HuggingFaceLLM(BaseLLM):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.last_token_usage = 0
        if api_key:
            # Mask key for safety
            masked = api_key[:4] + "..." + (api_key[-4:] if len(api_key) > 4 else "")
            logger.info(f"[HuggingFace] API Key provided: {masked}")
            
        if not api_key or api_key == "your_api_key_here" or api_key.startswith("gsk_"):
            logger.warning("[HuggingFace] API key is missing, dummy, or invalid (Groq key).")
            self.client = None
        else:
            self.client = InferenceClient(api_key=api_key)

    def generate(self, prompt: str, **kwargs) -> str:
        if not self.client:
            raise RuntimeError("Hugging Face API key is missing or invalid. Skipping provider.")
        self.last_token_usage = 0
            
        payload = {
            "model": "Qwen/Qwen3.5-35B-A3B",
            "messages": [
                {"role": "system", "content": "You are an expert prompt engineer."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 1024,
            "temperature": kwargs.get("temperature", 0.7),
            "top_p": kwargs.get("top_p", 0.9)
        }

        
        # Debug Logging: Request Payload
        logger.info(f"[HuggingFace] Request Payload: {payload}")
        
        try:
            # InferenceClient supports chat.completions.create for OpenAI compatibility
            response = self.client.chat.completions.create(**payload)
            # ADD THIS HERE: OpenAI-compatible token usage extraction for Qwen endpoint.
            usage = getattr(response, "usage", None)
            self.last_token_usage = int(getattr(usage, "total_tokens", 0) or 0)
            logger.info("[HuggingFace] Response received successfully.")
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"[HuggingFace] API Error: {str(e)}")
            raise RuntimeError(
                f"Hugging Face API call failed: {str(e)}"
            )

    def _simulate_response(self, prompt: str) -> str:
        import random
        return f"HuggingFace SIMULATION: Optimized prompt response layout metrics."