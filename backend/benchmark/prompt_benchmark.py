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
    score = 5.0
    response_lower = response.lower()
    
    # Penalize hallucination indicators
    hallucination_indicators = ["as an ai", "i don't have access", "i cannot", "i am an ai"]
    for ind in hallucination_indicators:
        if ind in response_lower:
            score -= 1.0
            
    # Reward structured reasoning
    if any(c in response for c in ["•", "-", "*"]) or "step " in response_lower or "1." in response:
        score += 1.0
        
    # Reward examples
    if "example" in response_lower or "for instance" in response_lower:
        score += 1.0
        
    # Reward completeness
    length = len(response)
    if length > 200:
        score += 1.0
    elif length < 50:
        score -= 1.0
        
    for k, v in requirements.items():
         if k.lower() in response_lower or str(v).lower() in response_lower:
              score += 0.5
              
    return min(10.0, max(1.0, float(score)))

def run_critic_agent(response_text: str, provider: str = "huggingface") -> dict:
    """
    Step 3: Critic Agent analyzes response deeply individually.
    """
    critic_prompt = f"""
You are a critical AI reviewer.
Analyze the following response:

"{response_text}"

Evaluate Accuracy, Completeness, Clarity, and Relevance.
Return EXACTLY a JSON object:
{{
  "score": 8,
  "accuracy": "accurate because...",
  "completeness": "missing...",
  "clarity": "clear and simple...",
  "relevance": "directly addresses..."
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
                 elif part.strip().startswith("json\n{"):
                     cleaned_json = part.strip()[5:].strip()
                     break
        if cleaned_json.startswith("json\n"):
             cleaned_json = cleaned_json[5:].strip()
        return json.loads(cleaned_json)
    except Exception as e:
        logger.warning(f"Critic Agent failed: {str(e)}")
        return {"score": 5, "accuracy": "N/A", "completeness": "Error", "clarity": "N/A", "relevance": "N/A"}

def run_judge_agent(responses: list, critiques: list, user_prompt: str, provider: str = "gemini") -> dict:
    """
    Step 4: Judge Agent selects best response based on response contents AND critiques feedbacks.
    """
    judge_prompt = f"""
You are an unbiased AI judge.
Analyze the following responses for the task "{user_prompt}" along with their critiques:

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
                 elif part.strip().startswith("json\n{"):
                     cleaned_json = part.strip()[5:].strip()
                     break
        if cleaned_json.startswith("json\n"):
             cleaned_json = cleaned_json[5:].strip()
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
    
    def generate_and_execute_variant(prov):
        def attempt_generation():
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
            # Generate Prompt
            res_prompt = generate_with_fallback(prov_prompt, prov)
            prompt_text = res_prompt["response"].strip()
            # clean up markdown if any
            if prompt_text.startswith("```"):
                lines = prompt_text.split('\n')
                if len(lines) >= 2:
                    prompt_text = '\n'.join(lines[1:]).replace("```", "").strip()
            
            # Generate Response using the generated prompt
            res_output = generate_with_fallback(prompt_text, prov)
            model_output = res_output["response"]
            
            return {
                "provider": prov, 
                "prompt": prompt_text,
                "response": model_output
            }

        try:
            return attempt_generation()
        except Exception as e1:
            logger.warning(f"First attempt failed for {prov}: {e1}. Retrying...")
            try:
                return attempt_generation()
            except Exception as e2:
                logger.error(f"Failed var for {prov} after retry: {e2}")
                fallback_prompt = f"Act as a professional assistant. Help the user with: {user_prompt}. Detailed optimization for {prov} model context."
                try:
                    res_fallback = generate_with_fallback(fallback_prompt, prov)
                    fallback_resp = res_fallback["response"]
                except:
                    fallback_resp = "Error generating response."
                return {"provider": prov, "prompt": fallback_prompt, "response": fallback_resp}

    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = {executor.submit(generate_and_execute_variant, prov): i for i, prov in enumerate(providers)}
        done, not_done = concurrent.futures.wait(futures.keys(), timeout=30)
        
        for future in done:
            idx = futures[future]
            try:
                variants[idx] = future.result()
            except Exception as e:
                logger.error(f"Future resulted in error: {e}")
                variants[idx] = None
                
        for future in not_done:
            idx = futures[future]
            logger.warning(f"Timeout for variant {idx} provider {providers[idx]}")
            future.cancel()
            variants[idx] = None

    for i in range(3):
         if not variants[i] or not variants[i].get("prompt") or not variants[i].get("response"):
              logger.warning(f"Variant {i+1} for {providers[i]} was empty or failed. Using fallback.")
              fallback_prompt = f"Act as a professional assistant. Help the user with: {user_prompt}."
              try:
                  res_fallback = generate_with_fallback(fallback_prompt, providers[i])
                  fallback_resp = res_fallback["response"]
              except:
                  fallback_resp = "Error generating response."
              variants[i] = {
                  "provider": providers[i], 
                  "prompt": fallback_prompt,
                  "response": fallback_resp
              }

    # 2. Evaluate Variants directly (Heuristic & Critic)
    h_scores = [compute_heuristic_score(var["response"], requirements) for var in variants]
    
    logger.info("Critic Agent: Analyzing response quality parallel nodes setups.")
    critiques = []
    with concurrent.futures.ThreadPoolExecutor() as executor:
        crit_futures = [executor.submit(run_critic_agent, var["response"]) for var in variants]
        critiques = [f.result() for f in crit_futures]
        
    logger.info("Judge Agent: Selecting best response based on contents and critiques.")
    judge_result = run_judge_agent(variants, critiques, user_prompt)
    
    try:
        best_index = int(judge_result.get("best_response", 1)) - 1
    except (ValueError, TypeError):
        best_index = 0
        
    if best_index < 0 or best_index >= len(variants):
        best_index = 0
        
    reason = judge_result.get("reason", "Selected by judge agent.")
    
    return_variants = []
    for idx in range(3):
        try:
             c_val = float(critiques[idx].get("score", 5)) if idx < len(critiques) else 5.0
        except (ValueError, TypeError):
             c_val = 5.0
             
        try:
             h_score = float(h_scores[idx])
        except (ValueError, TypeError):
             h_score = 5.0
             
        # Average heuristic and critic for metadata
        final_score = round((c_val + h_score) / 2.0, 1)
        final_score = min(10.0, max(1.0, final_score))
        
        return_variants.append({
            "provider": variants[idx]["provider"],
            "prompt": variants[idx]["prompt"],
            "response": variants[idx]["response"],
            "score": final_score,
            "critique": critiques[idx] if idx < len(critiques) else {}
        })

    best_prompt = return_variants[best_index]["prompt"]
    best_response = return_variants[best_index]["response"]
    
    best_prompts_history.append(best_prompt)
    if len(best_prompts_history) > 5:
        best_prompts_history.pop(0)

    return {
        "best_prompt": best_prompt,
        "best_response": best_response,
        "best_prompt_index": best_index,
        "judge_reason": reason,
        "variants": return_variants
    }
