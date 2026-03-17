import os
from groq import Groq
from llm.base_llm import BaseLLM

class GroqLLM(BaseLLM):
    def __init__(self, api_key: str):
        self.api_key = api_key
        if not api_key or api_key == "your_api_key_here":
            self.client = None
        else:
            self.client = Groq(api_key=api_key)

    def generate(self, prompt: str) -> str:
        if not self.client:
            return self._simulate_response(prompt)
            
        try:
            completion = self.client.chat.completions.create(
                model="llama3-70b-8192",
                messages=[
                    {"role": "system", "content": "You are an expert prompt engineer."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            return completion.choices[0].message.content
        except Exception as e:
            raise RuntimeError(
                "The selected AI model [Groq] is currently unavailable or the API key is invalid. Please choose another model."
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
