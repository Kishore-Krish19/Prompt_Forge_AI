from typing import Tuple
from agents.base_agent import BaseAgent

class IntentAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Intent Agent",
            role="User Intent Classifier",
            goal="Detect the user's intent from the raw prompt."
        )

    def run(self, user_prompt: str, provider: str = "groq") -> Tuple[str, str, int]:
        """
        Runs the intent detection logic using the LLM.
        """
        self.logger.info(f"Analyzing prompt with [{provider}]: '{user_prompt[:30]}...'")
        
        prompt_instruction = f"""
You are an expert intent classifier.
Classify the user's request into EXACTLY ONE of the following categories:
- coding
- writing
- design
- research
- data_analysis
- business
- image_generation

User Prompt:
"{user_prompt}"

Return ONLY the category name and nothing else.
Category:
"""
        # ADD THIS HERE: receive token usage from provider response.
        response_text, provider_used, token_usage = self._call_llm(prompt_instruction, provider)
        
        # Parse output
        category = response_text.strip().lower()
        
        valid_categories = ["coding", "writing", "design", "research", "data_analysis", "business", "image_generation"]
        if category not in valid_categories:
            self.logger.warning(f"Invalid category '{category}' detected. Defaulting to 'coding'.")
            category = "coding" # Safe default
        else:
            self.logger.info(f"Intent Agent detected category: {category}")
            
        # MODIFY THIS LINE: return token_usage with existing values.
        return category, provider_used, token_usage
