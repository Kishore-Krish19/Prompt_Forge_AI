from typing import List
from utils.llm_client import generate_response
from utils.prompt_templates import QUESTION_GENERATOR_PROMPT

def generate_questions(prompt: str, intent: str) -> List[str]:
    """
    Generate 4-6 clarification questions based on prompt and intent.
    """
    formatted_prompt = QUESTION_GENERATOR_PROMPT.format(prompt=prompt, intent=intent)
    response_text = generate_response(formatted_prompt)
    
    # Parse items by line break or index number triggers
    questions = []
    for line in response_text.split("\n"):
        line = line.strip()
        # Remove numbers if present, e.g. "1. Question?"
        if line and line[0].isdigit():
            # Find the index of the first letter
            for i, c in enumerate(line):
                if c.isalpha():
                    line = line[i:]
                    break
        if line and "?" in line:
            questions.append(line)
            
    # Default fallback questions if LLM response is brief
    if not questions:
        questions = [
            f"What is the target AI Model for your {intent} task?",
            "What is the preferred output format?",
            "Any specific constraints or guidelines?",
            "What level of detail do you need?"
        ]
        
    return questions[:6] # Return max 6
