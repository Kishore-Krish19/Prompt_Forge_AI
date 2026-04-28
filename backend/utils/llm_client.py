from groq import Groq
from utils.config import GROQ_API_KEY

# Instantiate Client
client = Groq(api_key=GROQ_API_KEY or "your_api_key_here")

def generate_response(prompt: str) -> str:
    """
    Sends the prompt to the AI model Llama3-70b and returns the generated text.
    """
    api_key = GROQ_API_KEY
    
    if not api_key:
        # Fallback Simulator for development safety triggers
        return _simulate_response(prompt)

    try:
        completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": "You are an expert prompt engineer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Error communicating with Groq: {str(e)}"

def _simulate_response(prompt: str) -> str:
    """Fallback simulator for response triggers logic."""
    import random
    prompt_lower = prompt.lower()
    
    if "classify" in prompt_lower or "category" in prompt_lower:
        categories = ["coding", "writing", "design", "research", "data_analysis", "business"]
        return random.choice(categories)
        
    if "questions" in prompt_lower or "clarification" in prompt_lower:
        return '["What is the target AI Model?", "What is the preferred format?", "Any constraints?"]'
        
    if "evaluate" in prompt_lower or "score" in prompt_lower:
        return '{"score": 88, "suggestions": ["Be more specific on tech stack", "Add explicit constraints parameters"]}'
        
    return "# Role\nYou are an expert AI Assistant.\n\n# Task\nComplete the user guide.\n\n# Requirements\n- Accurate documentation.\n\n# Constraints\n- High quality response."
