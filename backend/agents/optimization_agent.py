from typing import Dict, Tuple
from agents.base_agent import BaseAgent

class OptimizationAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Optimization Agent",
            role="Prompt Optimizer Specialist",
            goal="Transform the user's rough prompt into a highly optimized prompt layout."
        )

    def run(self, user_prompt: str, requirements: Dict[str, str], provider: str = "groq") -> Tuple[str, str, int]:
        """
        Runs the prompt optimization logic using the LLM.
        """
        self.logger.info(f"Optimizing prompt using [{provider}] with {len(requirements)} requirements.")
        
        reqs_str = ""
        for k, v in requirements.items():
            if v:
                reqs_str += f"- {k.title()}: {v}\n"
                
        if not reqs_str:
            reqs_str = "- General instructions only"

        prompt_instruction = f"""
You are a world-class prompt engineer.
Transform the following rough user prompt into a highly optimized prompt that will produce the absolute best possible AI response.

User Prompt: "{user_prompt}"
User Requirements/Answers:
{reqs_str}

Use the following exact structure in your response:

# Role
[Set high performance persona]

# Task
[Define task clearly]

# Requirements
[List requirements in bullets]

# Constraints
[List guidelines/constraints]

# Output Format
[Define structure clearly]

Return ONLY the optimized prompt and nothing else. No explanation.
"""
        # ADD THIS HERE: receive token usage from provider response.
        optimized, provider_used, token_usage = self._call_llm(prompt_instruction, provider)
        
        # Fallback structured prompt construction if response was messy
        if not optimized.startswith("# Role"):
            self.logger.warning("Agent response did not meet structural guidelines. Applying fallback.")
            fallback_prompt = (
                f"# Role\nYou are an expert AI Assistant.\n\n"
                f"# Task\n{user_prompt}\n\n"
                f"# Requirements\n{reqs_str}\n\n"
                f"# Constraints\n- Ensure accuracy.\n- Maintain high quality responses.\n\n"
                f"# Output Format\nDefault structure and instructions."
            )
            # MODIFY THIS LINE: return token_usage with existing values.
            return fallback_prompt, provider_used, token_usage

        self.logger.info("Optimization complete.")
        # MODIFY THIS LINE: return token_usage with existing values.
        return optimized, provider_used, token_usage
