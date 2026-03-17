import json
from typing import List, Tuple
from agents.base_agent import BaseAgent

class RequirementAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="RequirementAgent",
            role="Context Harvester",
            goal="Generate clarification questions as a JSON list."
        )

    def run(self, user_prompt: str, intent: str, provider: str = "groq") -> Tuple[List[str], str]:
        """
        Runs the questions generation logic using LLM.
        Forces JSON list outputs.
        """
        self.logger.info(f"Generating questions using [{provider}] for intent: {intent}")
        
        prompt_instruction = f"""
You are an AI prompt engineer assistant.
Based on the user's rough prompt and detected intent, generate 4-6 clarification questions to help convert this into a highly optimized structured instruction.

User Prompt: "{user_prompt}"
Intent: {intent}

Return your response EXACTLY as a JSON list of strings representing the questions, for example:
["Question 1?", "Question 2?"]

Return ONLY valid JSON and nothing else. No explanation.
"""
        response_text, provider_used = self._call_llm(prompt_instruction, provider)
        
        # Parse JSON List outputs
        try:
            # Clean possible Markdown wrappers (e.g., ```json)
            cleaned_text = response_text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:-3].strip()
            elif cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:-3].strip()
                
            questions = json.loads(cleaned_text)
            if isinstance(questions, list):
                self.logger.info(f"Generated {len(questions)} items from JSON stream.")
                return questions[:6], provider_used
        except Exception as e:
            self.logger.warning(f"Failed to parse JSON questions stream: {str(e)}. Falling back to manual split.")

        # Fallback splitting logic if JSON failed
        questions = []
        for line in response_text.split("\n"):
            line = line.strip()
            if line and "?" in line:
                questions.append(line)
                
        if not questions:
            questions = [
                f"What is the target AI Model for your {intent} task?",
                "What is the preferred output format?",
                "Any specific constraints or guidelines?",
                "What level of detail do you need?"
            ]
            
        return questions[:6], provider_used
