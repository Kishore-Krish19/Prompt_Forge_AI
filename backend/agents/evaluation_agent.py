import json
from typing import Dict, List, Tuple
from agents.base_agent import BaseAgent

class EvaluationAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Evaluation Agent",
            role="Prompt Quality Auditor",
            goal="Analyze prompt quality across clarity, context, and structure metrics layout."
        )

    def run(self, optimized_prompt: str, provider: str = "groq") -> Tuple[int, Dict[str, int], List[str], str, int]:
        """
        Runs the prompt scoring logic using LLM.
        """
        self.logger.info(f"Evaluating prompt using [{provider}] metrics triggers.")
        
        prompt_instruction = f"""
You are an expert prompt auditor system.
Evaluate the following prompt on 5 key dimensions from 0 to 100:
1. Clarity (Is it easy to understand?)
2. Specificity (Are details provided?)
3. Context (Does it provide background?)
4. Constraints (Are guidelines present?)
5. Output Format (Is layout specified?)

Prompt to Evaluate:
"{optimized_prompt}"

Return your response EXACTLY as a JSON object:
{{
  "score": 85,
  "breakdown": {{
    "clarity": 90,
    "specificity": 80,
    "context": 85,
    "constraints": 80,
    "output_format": 90
  }},
  "suggestions": [
    "Suggestion 1",
    "Suggestion 2"
  ]
}}

Return ONLY valid JSON and nothing else.
"""
        # ADD THIS HERE: receive token usage from provider response.
        response_text, provider_used, token_usage = self._call_llm(prompt_instruction, provider)
        
        score = 50
        analysis = {
            "clarity": 50, "specificity": 50, "context": 50, 
            "constraints": 50, "output_format": 50
        }
        suggestions = []

        try:
            # Clean possible markdown wrappers
            cleaned_text = response_text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:-3].strip()
            elif cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:-3].strip()
                
            data = json.loads(cleaned_text)
            score = data.get("score", 50)
            suggestions = data.get("suggestions", [])
            
            # Simple heuristic breakdown weights for visual interface
            # Since the prompt asks for overall score, we map it back or generate breakdown
            analysis = {
                "clarity": int(score * 0.9),
                "specificity": int(score * 0.8),
                "context": int(score * 1.0),
                "constraints": int(score * 0.7),
                "output_format": int(score * 0.85)
            }
            if score > 100: score = 100

        except Exception as e:
            self.logger.warning(f"Failed to parse JSON score evaluation stream: {str(e)}. Falling back manual score.")

            # Fallback static heuristics score breaker calculation if JSON fails (Previous heuristic logic)
            prompt_lower = optimized_prompt.lower()
            clarity = 80 if len(optimized_prompt) > 20 else 40
            specificity = 60 if "specific" in prompt_lower or any(word in prompt_lower for word in ["build", "create", "solve"]) else 40
            score = int((clarity + specificity + 130) / 3) # Average fallback
            suggestions = ["Ensure clarity and refine constraints list layout setup parameters."]

        self.logger.info(f"Evaluation finished. Computed score: {score}")
        # MODIFY THIS LINE: return token_usage with existing values.
        return score, analysis, suggestions[:4], provider_used, token_usage
