from typing import Dict
from utils.llm_client import generate_response
from utils.prompt_templates import PROMPT_OPTIMIZER_PROMPT

def optimize_prompt(prompt: str, requirements: Dict[str, str]) -> str:
    """
    Take user prompt & requirements and combine into structured prompt template output.
    """
    # Convert requirements dict to formatted string
    reqs_str = ""
    for k, v in requirements.items():
        if v:
            reqs_str += f"- {k.title()}: {v}\n"
            
    if not reqs_str:
        reqs_str = "- General instructions only"

    formatted_prompt = PROMPT_OPTIMIZER_PROMPT.format(prompt=prompt, requirements=reqs_str)
    
    # Run LLM to generate optimized prompt
    optimized = generate_response(formatted_prompt)
    
    # Clean output formatting triggers if LLM went off-topic
    if not optimized.startswith("# Role"):
        # Fallback structured prompt construction if response was messy
        fallback_prompt = f"# Role\nYou are an expert AI Assistant.\n\n# Task\n{prompt}\n\n# Requirements\n{reqs_str}\n\n# Constraints\n- Ensure accuracy.\n- Maintain high quality responses.\n\n# Output Format\nDefault structure and instructions."
        return fallback_prompt

    return optimized
