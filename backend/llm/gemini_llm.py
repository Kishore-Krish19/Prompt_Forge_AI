import os
import logging
import google.generativeai as genai
from llm.base_llm import BaseLLM

logger = logging.getLogger(__name__)

class GeminiLLM(BaseLLM):
    def __init__(self, api_key: str):
        self.api_key = api_key
        if api_key:
            masked = api_key[:4] + "..." + (api_key[-4:] if len(api_key) > 4 else "")
            logger.info(f"[Gemini] API Key provided: {masked}")
            
        if not api_key or api_key == "your_api_key_here":
            logger.warning("[Gemini] API key is missing or is dummy placeholder.")
            self.model = None
        else:
            genai.configure(api_key=api_key)
            # Update Model to gemini-2.5-flash
            self.model = genai.GenerativeModel("gemini-2.5-flash")

    def generate(self, prompt: str, **kwargs) -> str:
        if not self.model:
            # Task 5: Skip provider with warning
            raise RuntimeError("Gemini API key is missing or invalid. Skipping provider.")
            
        # Debug Logging: Request Prompt
        logger.info(f"[Gemini] Request Prompt: {prompt}")
        
        # Build generation config if kwargs present
        generation_config = {}
        if "temperature" in kwargs:
            generation_config["temperature"] = kwargs["temperature"]
        if "top_p" in kwargs:
            generation_config["top_p"] = kwargs["top_p"]
            
        try:
            # Pass generation_config if not empty
            if generation_config:
                response = self.model.generate_content(prompt, generation_config=generation_config)
            else:
                response = self.model.generate_content(prompt)

            logger.info("[Gemini] Response received successfully.")
            return response.text
        except Exception as e:
            logger.error(f"[Gemini] API Error: {str(e)}")
            raise RuntimeError(
                f"Gemini API call failed: {str(e)}"
            )

    def _simulate_response(self, prompt: str) -> str:
        return f"Gemini SIMULATION: Optimized prompt response layout metrics."
