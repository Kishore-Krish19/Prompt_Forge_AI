import json
import logging
import concurrent.futures
import time
from llm.fallback_manager import generate_with_fallback

logger = logging.getLogger(__name__)

# Step 7: Memory-Based Improvement (Persistent History capped 5)
best_prompts_history = []

def smart_select_provider(user_prompt: str, default_provider: str) -> str:
    """
    Dynamically select model based on task keywords triggers.
    """
    prompt_lower = user_prompt.lower()
    if "code" in prompt_lower:
         return "groq"
    elif "image" in prompt_lower or "paint" in prompt_lower:
         return "huggingface"
    elif "analysis" in prompt_lower:
         return "gemini"
    return default_provider

def compute_heuristic_score(response: str, requirements: dict) -> float:
    """
    Step 3: Compute standalone Heuristic score bounded 1-10.
    """
    score = 0
    length = len(response)
    
    if length < 50:
         score -= 2
    else:
         score += min(10, max(1, length / 100))
    
    if any(c in response for c in ["•", "-", "*"]) or "step" in response.lower() or "#" in response:
         score += 2
         
    for k, v in requirements.items():
         if k.lower() in response.lower() or str(v).lower() in response.lower():
              score += 1
              
    return min(10.0, max(1.0, float(score)))

def run_critic_agent(response_text: str, provider: str = "huggingface") -> dict:
    """
    Step 3: Critic Agent analyzes response deeply individually.
    """
    critic_prompt = f"""
You are a critical AI reviewer.
Analyze the following response:

"{response_text}"

Evaluate Strengths, Weaknesses, Missing elements, and Improvement suggestions.
Return EXACTLY a JSON object:
{{
  "score": 8,
  "strengths": "accurate and clear...",
  "weaknesses": "could be more detailed...",
  "improvements": "add examples..."
}}
Return ONLY valid JSON and nothing else. No explanations. No markdown backticks.
"""
    try:
        res = generate_with_fallback(critic_prompt, provider)
        cleaned_json = res["response"].strip()
        if "```" in cleaned_json:
             parts = cleaned_json.split("```")
             for part in parts:
                 if part.strip().startswith("{"):
                     cleaned_json = part.strip()
                     break
        return json.loads(cleaned_json)
    except Exception as e:
        logger.warning(f"Critic Agent failed: {str(e)}")
        return {"score": 5, "strengths": "N/A", "weaknesses": "Error", "improvements": "N/A"}

def run_judge_agent(responses: list, critiques: list, user_prompt: str, provider: str = "gemini") -> dict:
    """
    Step 4: Judge Agent selects best response based on response contents AND critiques feedbacks.
    """
    judge_prompt = f"""
You are an unbiased AI judge.
Analyze the following responses for the task "{user_prompt}" along with their críticas:

Response 1 (Model: {responses[0]['provider']}):
{responses[0]['response']}
Critique 1:
{json.dumps(critiques[0])}

Response 2 (Model: {responses[1]['provider']}):
{responses[1]['response']}
Critique 2:
{json.dumps(critiques[1])}

Response 3 (Model: {responses[2]['provider']}):
{responses[2]['response']}
Critique 3:
{json.dumps(critiques[2])}

Select the BEST response based on Accuracy, Completeness, Clarity, and Real-world usefulness.
Return EXACTLY a JSON object:
{{
  "best_response": 1,
  "reason": "accurate and well structured..."
}}
Return ONLY valid JSON and nothing else. No explanations. No markdown backticks.
"""
    try:
        # Step 8: Use stronger Judge
        res = generate_with_fallback(judge_prompt, provider)
        cleaned_json = res["response"].strip()
        if "```" in cleaned_json:
             parts = cleaned_json.split("```")
             for part in parts:
                 if part.strip().startswith("{"):
                     cleaned_json = part.strip()
                     break
        return json.loads(cleaned_json)
    except Exception as e:
         logger.warning(f"Judge Agent failed: {str(e)}")
         return {"best_response": 1, "reason": "Fallback due to failure"}

def run_benchmark(user_prompt: str, requirements: dict, provider: str = "groq") -> dict:
    """
    Upgraded Multi-Agent Prompt Optimization Engine with parallel execution trigger setups setups triggers.
    """
    logger.info("Generator Agent: Creating 3 diverse variants from 3 providers.")
    reqs_str = json.dumps(requirements)
    providers = ["groq", "huggingface", "gemini"]
    
    # 1. Generate Variants in Parallel
    variants = [None] * 3
    
    def generate_variant(prov, idx):
        try:
            style = ""
            if prov == "groq":
                style = "Focus on extreme conciseness, structured bullet points, and high efficiency."
            elif prov == "huggingface":
                style = "Focus on creative, descriptive, and highly detailed elaboration."
            elif prov == "gemini":
                style = "Focus on analytical depth, sequential reasoning, and clear formatting."
            
            prov_prompt = f"""
You are a Prompt Engineering Expert.
Improve the following user prompt into a high-quality, clear, and structured prompt.
{style}
Include all necessary constraints and context from requirements.
User prompt: "{user_prompt}"
User requirements: {reqs_str}

Return EXACTLY the optimized prompt ONLY. No explanation. No markdown backticks.
"""
            res = generate_with_fallback(prov_prompt, prov)
            prompt_text = res["response"].strip()
            # clean up markdown if any
            if prompt_text.startswith("```"):
                lines = prompt_text.split('\n')
                if len(lines) >= 2:
                    prompt_text = '\n'.join(lines[1:]).replace("```", "").strip()
            variants[idx] = {"provider": prov, "prompt": prompt_text}
        except Exception as e:
            logger.error(f"Failed var for {prov}: {e}")
            variants[idx] = {"provider": prov, "prompt": f"Failed to generate optimized prompt via {prov}."}

    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = []
        for i, prov in enumerate(providers):
            futures.append(executor.submit(generate_variant, prov, i))
        concurrent.futures.wait(futures, timeout=30)

    for i in range(3):
         if not variants[i] or not variants[i].get("prompt") or len(variants[i]["prompt"]) < 5:
              logger.warning(f"Variant {i+1} for {providers[i]} was empty or failed. Using fallback.")
              variants[i] = {
                  "provider": providers[i], 
                  "prompt": f"Act as a professional assistant. Help the user with: {user_prompt}. Detailed optimization for {providers[i]} model context."
              }

    # 2. Evaluate Variants directly (Heuristic & Critic)
    h_scores = [compute_heuristic_score(var["prompt"], requirements) for var in variants]
    
    logger.info("Critic Agent: Analyzing prompt quality parallel nodes setups.")
    critiques = []
    with concurrent.futures.ThreadPoolExecutor() as executor:
        crit_futures = [executor.submit(run_critic_agent, var["prompt"]) for var in variants]
        critiques = [f.result() for f in crit_futures]
        
    logger.info("Judge Agent: Selecting best variant directly via highest computed float score.")
    
    results = {}
    return_variants = []
    final_scores = []
    
    for idx in range(3):
        key = f"prompt{idx+1}"
        
        try:
             c_val = critiques[idx].get("score", 5) if idx < len(critiques) else 5
             l_score = float(c_val)
        except (ValueError, TypeError):
             l_score = 5.0
             
        # Add small unique decimal to pseudo-randomize ties based on prompt length characteristics
        len_bonus = (len(variants[idx]["prompt"]) % 10) / 40.0 
        
        try:
             h_score = float(h_scores[idx])
        except:
             h_score = 5.0
             
        # Average heuristic and critic with slightly weighted bonus, accurately representing quality out of 10.
        final_score = round((l_score + h_score) / 2.0 + len_bonus, 1)
        final_score = min(10.0, max(1.0, final_score))
        
        results[key] = final_score
        final_scores.append(final_score)
        
        return_variants.append({
            "provider": variants[idx]["provider"],
            "prompt": variants[idx]["prompt"],
            "score": final_score
        })

    # Pick actual highest dynamic score index as Winner! No defaults! 
    best_index = final_scores.index(max(final_scores))
    best_prompt = return_variants[best_index]["prompt"]
    
    best_prompts_history.append(best_prompt)
    if len(best_prompts_history) > 5:
        best_prompts_history.pop(0)

    return {
        "best_prompt": best_prompt,
        "benchmark_results": results,
        "best_prompt_index": best_index,
        "variants": return_variants
    }
