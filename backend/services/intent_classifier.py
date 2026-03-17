from utils.llm_client import generate_response
from utils.prompt_templates import INTENT_CLASSIFICATION_PROMPT

def classify_intent(prompt: str) -> str:
    """
    Classify the user's prompt into categories like coding, writing, design, etc.
    """
    # Format prompt from template
    formatted_prompt = INTENT_CLASSIFICATION_PROMPT.format(prompt=prompt)
    
    # Run LLM
    response_text = generate_response(formatted_prompt)
    
    # Clean and parse response
    category = response_text.strip().lower()
    
    # Fallback to general intent if output is messy
    valid_categories = ["coding", "writing", "design", "research", "data analysis", "business"]
    for cat in valid_categories:
        if cat in category:
            return cat
            
    return "general"
