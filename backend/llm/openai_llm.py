from openai import OpenAI
from llm.base_llm import BaseLLM

class OpenAILLM(BaseLLM):
    def __init__(self, api_key: str):
        self.api_key = api_key
        if not api_key or api_key == "your_api_key_here":
            self.client = None
        else:
            self.client = OpenAI(api_key=api_key)

    def generate(self, prompt: str) -> str:
        if not self.client:
            return self._simulate_response(prompt)
            
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert prompt engineer."},
                    {"role": "user", "content": prompt}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            raise RuntimeError(
                "The selected AI model [OpenAI] is currently unavailable or the API key is invalid. Please choose another model."
            )

    def _simulate_response(self, prompt: str) -> str:
        # standard fallback logics
        import random
        return f"OpenAI SIMULATION: Optimized prompt response layout metrics."
