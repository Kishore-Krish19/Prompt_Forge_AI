import json
import logging
import concurrent.futures
import time
import re
from llm.fallback_manager import generate_with_fallback

logger = logging.getLogger(__name__)

# Step 7: Memory-Based Improvement (Persistent History capped 5)
best_prompts_history = []

def clean_json_response(response_data: str) -> str:
    """Robustly extracts JSON from LLM markdown or conversational text."""
    if not response_data:
        return "{}"
    # Remove markdown code blocks if present
    cleaned = re.sub(r'```json\s*|```\s*', '', response_data).strip()
    # Find the first '{' and last '}'
    start = cleaned.find('{')
    end = cleaned.rfind('}')
    if start != -1 and end != -1:
        return cleaned[start:end+1]
    return cleaned

def compute_heuristic_score(response: str, requirements: dict) -> float:
    """Compute standalone Heuristic score bounded 1-10."""
    if not isinstance(response, str):
        response = str(response)
    
    score = 5.0
    response_lower = response.lower()
    
    # Penalize common 'AI refusal' or 'filler' phrases
    hallucination_indicators = ["as an ai", "i don't have access", "i cannot", "i am an ai"]
    for ind in hallucination_indicators:
        if ind in response_lower:
            score -= 1.5
            
    # Reward structure and formatting
    if any(c in response for c in ["•", "-", "*", "1.", "Step"]):
        score += 1.5
        
    # Reward depth/length balance
    length = len(response)
    if 300 < length < 1500: # "Sweet spot" for quality
        score += 1.0
    elif length < 100:
        score -= 2.0
        
    # Check for requirement keywords
    if isinstance(requirements, dict):
        for k, v in requirements.items():
            if k.lower() in response_lower or str(v).lower() in response_lower:
                score += 0.5
              
    return min(10.0, max(1.0, float(score)))

def run_critic_agent(response_text: str, provider: str = "huggingface") -> dict:
    """Critic Agent analyzes response deeply."""
    default_safe = {"score": 5, "accuracy": "N/A", "completeness": "N/A", "clarity": "N/A", "relevance": "N/A"}
    
    critic_prompt = f"""
Analyze the following AI response for Accuracy, Completeness, and Clarity:
"{response_text}"

Return ONLY a JSON object:
{{"score": 1-10, "accuracy": "string", "completeness": "string", "clarity": "string", "relevance": "string"}}
"""
    try:
        res = generate_with_fallback(critic_prompt, provider)
        content = res.get("response") if isinstance(res, dict) else None
        return json.loads(clean_json_response(content))
    except Exception as e:
        logger.error(f"Critic Agent failed: {e}")
        return default_safe

def run_judge_agent(variants: list, critiques: list, user_prompt: str, provider: str = "gemini") -> dict:
    """Judge Agent compares all variants and their critiques to pick a winner."""
    comparison_data = ""
    for i, var in enumerate(variants):
        comparison_data += f"\n--- OPTION {i+1} (Model: {var['provider']}) ---\n"
        comparison_data += f"PROMPT USED: {var['prompt']}\n"
        comparison_data += f"RESPONSE PRODUCED: {var['response'][:500]}...\n"
        comparison_data += f"CRITIQUE: {json.dumps(critiques[i])}\n"

    judge_prompt = f"""
You are an expert Prompt Engineer and Quality Judge.
The user's original goal was: "{user_prompt}"

Compare these 3 versions based on which Prompt produced the most useful, accurate, and professional result.
{comparison_data}

Identify which OPTION (1, 2, or 3) is the absolute best.
Return ONLY a JSON object:
{{
  "best_response_index": 1,
  "reason": "Explain why this prompt/response outperformed the others."
}}
"""
    try:
        res = generate_with_fallback(judge_prompt, provider)
        content = res.get("response") if isinstance(res, dict) else None
        return json.loads(clean_json_response(content))
    except Exception:
        return {"best_response_index": 1, "reason": "Defaulted to first variant."}

def run_benchmark(user_prompt: str, requirements: dict) -> dict:
    """Optimized Engine to compare Groq, Huggingface, and Gemini."""
    providers = ["groq", "huggingface", "gemini"]
    variants = []

    def process_provider(prov):
        # 1. Generate an optimized version of the prompt using that specific model's strengths
        opt_prompt_query = f"Improve this prompt for a high-quality AI response. Original: '{user_prompt}'. Reqs: {requirements}. Return only the new prompt text."
        res_opt = generate_with_fallback(opt_prompt_query, prov)
        improved_prompt = res_opt.get("response", user_prompt).strip()
        
        # 2. Run that optimized prompt through the same model
        res_final = generate_with_fallback(improved_prompt, prov)
        return {
            "provider": prov,
            "prompt": improved_prompt,
            "response": res_final.get("response", "No response generated.")
        }

    # Parallel generation for speed
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = [executor.submit(process_provider, p) for p in providers]
        variants = [f.result() for f in futures]

    # Evaluate variants
    h_scores = [compute_heuristic_score(v["response"], requirements) for v in variants]
    
    with concurrent.futures.ThreadPoolExecutor() as executor:
        crit_futures = [executor.submit(run_critic_agent, v["response"]) for v in variants]
        critiques = [f.result() for f in crit_futures]

    # Judge the winner
    judge_decision = run_judge_agent(variants, critiques, user_prompt)
    
    # Extract winner (handling 1-based index from LLM)
    idx = judge_decision.get("best_response_index", 1) - 1
    idx = max(0, min(idx, 2)) # Safety clamp

    # Format return
    final_variants = []
    for i in range(3):
        avg_score = (h_scores[i] + critiques[i].get("score", 5)) / 2
        final_variants.append({
            **variants[i],
            "score": round(avg_score, 1),
            "critique": critiques[i]
        })

    return {
        "best_prompt": final_variants[idx]["prompt"],
        "best_response": final_variants[idx]["response"],
        "winner_model": final_variants[idx]["provider"],
        "judge_reason": judge_decision.get("reason"),
        "all_variants": final_variants
    }