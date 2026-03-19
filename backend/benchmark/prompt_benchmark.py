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
    # Step 7: Smart Model Selection Setup
    provider = smart_select_provider(user_prompt, provider)
    logger.info(f"Smart selected Generator provider: {provider}")

    logger.info("Generator Agent: Creating 3 diverse variants.")
    reqs_str = json.dumps(requirements)
    
    variant_prompt = f"""
You are a Prompt Generation Agent.
Generate 3 HIGHLY DIVERSE prompt variants using different strategies from following:

1. Structured Prompt (step-by-step, clear instructions, headers)
2. Creative Prompt (descriptive, rich context layout triggers)
3. Minimal Prompt (short, efficient, direct setups node)

User prompt: "{user_prompt}"
User requirements: {reqs_str}

Return EXACTLY a JSON object with a 'prompt_variants' array containing EXACTLY 3 strings.
{{
  "prompt_variants": [
    "Variant 1 optimized...",
    "Variant 2 optimized...",
    "Variant 3 optimized..."
  ]
}}
Return ONLY valid JSON and nothing else. No explanation. No markdown backticks.
"""
    # Step 7: Memory Limit 5
    if len(best_prompts_history) > 5:
         best_prompts_history.pop(0)
    if best_prompts_history:
        variant_prompt += f"\nUse this as inspiration (previous best prompt setup):\n{best_prompts_history[-1]}\n"

    try:
        res1 = generate_with_fallback(variant_prompt, provider)
        variants_json = res1["response"]
        cleaned_json = variants_json.strip()
        if "```" in cleaned_json:
             parts = cleaned_json.split("```")
             for part in parts:
                 if part.strip().startswith("{"):
                      cleaned_json = part.strip()
                      break
        variants = json.loads(cleaned_json)["prompt_variants"]
    except Exception as e:
        logger.error(f"Failed to generate prompt variants: {str(e)}")
        variants = [
            f"Role: Expert.\nTask: {user_prompt}.",
            f"Instructions: Execute {user_prompt} step-by-step.",
            f"Background: Expert Context.\nAction: {user_prompt}."
        ]

    logger.info("Executor Agent: Running parallel variants execution cycle.")
    providers = ["groq", "gemini", "huggingface"]
    responses = [None] * 3

    # Parallel Execution Helpers
    def execute_with_time(variant, provider_to_use, **kwargs):
         start = time.time()
         resp = generate_with_fallback(variant, provider_to_use, **kwargs)
         elapsed = time.time() - start
         return {"provider": provider_to_use, "response": resp["response"], "elapsed": elapsed}

    with concurrent.futures.ThreadPoolExecutor() as executor:
         futures = []
         for i in range(min(3, len(variants))):
              prov = providers[i % len(providers)]
              logger.info(f"Scheduling Variant {i+1} on {prov}")
              futures.append(executor.submit(execute_with_time, variants[i], prov, temperature=0.7, top_p=0.9))
         
         completed, _ = concurrent.futures.wait(futures, timeout=15)
         for f in futures:
              idx = futures.index(f)
              if f in completed:
                   try:
                        res_val = f.result()
                        responses[idx] = res_val
                        logger.info(f"Variant {idx+1} ({res_val['provider']}) took {res_val['elapsed']:.2f}s")
                   except Exception as e:
                        logger.warning(f"Variant {idx+1} failed: {str(e)}")
                        responses[idx] = {"provider": providers[idx % len(providers)], "response": f"Simulation failure {idx+1} triggers.", "elapsed": 0}
              else:
                   logger.warning(f"Variant {idx+1} Triggers Timed out shortcut loops.")
                   responses[idx] = {"provider": providers[idx % len(providers)], "response": "Execution Timed out after 15s.", "elapsed": 15}

    # Fill blanks safely
    for idx_b in range(3):
         if not responses[idx_b]:
              responses[idx_b] = {"provider": providers[idx_b], "response": "Padded fallback Node available.", "elapsed": 0}

    # Step 6: Similarity Filter Duplicate Regeneration
    for i in range(1, 3):
         if responses[i]["response"][:100] == responses[i-1]["response"][:100]:
              logger.info(f"Duplicate responses ({i+1} Match previous). Regenerating with temp=0.9 triggers loops setup.")
              try:
                   retry_res = generate_with_fallback(variants[i], responses[i]["provider"], temperature=0.9, top_p=0.9)
                   responses[i]["response"] = retry_res["response"]
              except Exception:
                   pass

    # Step 8: Cost Speed validation skipping shortcuts setups Heuristics
    h_scores = [compute_heuristic_score(responses[rx]["response"], requirements) for rx in range(3)]
    skipped_decision = False
    best_index = 0
    if max(h_scores) >= 9 and any(s <= 6 for s in h_scores):
         logger.info("One response clearly superior (Heuristic Opt triggers). Skipping Critic/Judge setups shortcuts.")
         skipped_decision = True
         best_index = h_scores.index(max(h_scores))
         results = {f"prompt{rk+1}": int(h_scores[rk]) for rk in range(3)}

    critiques = []
    if not skipped_decision:
         logger.info("Critic Agent: Analyzing response quality parallel nodes setups.")
         # Step 8: Use cheap Critic setup triggers
         with concurrent.futures.ThreadPoolExecutor() as executor:
              crit_futures = [executor.submit(run_critic_agent, responses[rx]["response"]) for rx in range(3)]
              critiques = [f.result() for f in crit_futures]
              
         logger.info("Judge Agent: Selecting best variant iteratively loads.")
         judge_res = run_judge_agent(responses, critiques, user_prompt, provider="gemini")
         best_index = judge_res.get("best_response", 1) - 1 # 0-indexed
         logger.info(f"Judge Agent selected best Variant {best_index+1} reason: {judge_res.get('reason')}")

         results = {}
         for idx in range(3):
              key = f"prompt{idx+1}"
              l_score = critiques[idx].get("score", 5) if idx < len(critiques) else 5
              h_score = h_scores[idx]
              results[key] = int((float(l_score) + float(h_score)) / 2.0)
              logger.info(f"Scores {key}: LLM Critic={l_score}, Heuristic={h_score}, Hybrid={results[key]}")

    # Step 5: Iterative Refinement Agent cycles trigger setups
    best_prompt = variants[best_index]
    best_critique = critiques[best_index] if best_index < len(critiques) else critiques[0] if critiques else {}

    logger.info("Refinement Agent Starting cycle refinement triggers iterative loads.")
    for iteration in range(2):
         logger.info(f"Refinement Cycle {iteration+1}/2.")
         refine_prompt = f"""
You are a Prompt Refinement Agent.
Improve the following prompt factoring Critic feedbacks effectively accurately.

Prompt:
{best_prompt}

Critique feedback context:
{json.dumps(best_critique)}

Return EXACTLY improved prompt ONLY. No explanation. No markdown backticks.
"""
         try:
              res_refine = generate_with_fallback(refine_prompt, "huggingface")
              best_prompt = res_refine["response"].strip()
         except Exception as e:
              logger.warning(f"Refinement iteration failures: {str(e)}")

    best_prompts_history.append(best_prompt)

    return {
        "best_prompt": best_prompt,
        "benchmark_results": results,
        "best_prompt_index": best_index
    }
