import google.generativeai as genai
from llm.base_llm import BaseLLM

class GeminiLLM(BaseLLM):
    def __init__(self, api_key: str):
        self.api_key = api_key
        if not api_key or api_key == "your_api_key_here":
            self.model = None
        else:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel("gemini-1.5-flash")

    def generate(self, prompt: str) -> str:
        if not self.model:
            return self._simulate_response(prompt)
            
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            raise RuntimeError(
                "The selected AI model [Gemini] is currently unavailable or the API key is invalid. Please choose another model."
            )

    def _simulate_response(self, prompt: str) -> str:
        return f"Gemini SIMULATION: Optimized prompt response layout metrics."
