from typing import Dict, List, Tuple

def score_prompt(prompt: str) -> Tuple[int, Dict[str, int], List[str]]:
    """
    Evaluate the prompt using simple heuristics logic out of 100.
    """
    prompt_lower = prompt.lower()
    
    # Metrics
    clarity = 80 if len(prompt) > 20 else 40
    specificity = 60 if "specific" in prompt_lower or any(word in prompt_lower for word in ["build", "create", "solve"]) else 40
    context = 70 if "role" in prompt_lower or "actor" in prompt_lower or "expert" in prompt_lower else 50
    constraints = 50 if "not" in prompt_lower or "avoid" in prompt_lower or "must" in prompt_lower else 30
    output_format = 40 if "format" in prompt_lower or "list" in prompt_lower or "structure" in prompt_lower else 20

    # Calculate Score Average
    score = int((clarity + specificity + context + constraints + output_format) / 5)
    
    analysis = {
        "clarity": clarity,
        "specificity": specificity,
        "context": context,
        "constraints": constraints,
        "output_format": output_format
    }
    
    # Suggestions Generation
    suggestions = []
    if clarity < 70:
        suggestions.append("Add more descriptive text or headers and spacing to make guidelines instructions clearer.")
    if specificity < 70:
        suggestions.append("Specify accurate tech stacks tags tools frameworks relative targets triggers.")
    if context < 70:
        suggestions.append("Explicitly state the Role/Actor persona inside Role setup triggers.")
    if constraints < 70:
        suggestions.append("Add explicit constraints triggers (e.g. constraints boundaries length lists bounds avoid types).")
    if output_format < 70:
        suggestions.append("Explicitly list structured output triggers (e.g., json format structure section layout).")

    # Default suggestions if score is high
    if not suggestions:
        suggestions = ["Ensure accuracy and refine constraints boundary values."]

    return score, analysis, suggestions[:4] # Return max 4
