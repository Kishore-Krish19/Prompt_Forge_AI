import sys
import os
import types

# Ensure backend package import path is available
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Create a fake llm.fallback_manager to avoid external dependencies during the smoke test
fake_mod = types.ModuleType("llm.fallback_manager")

def fake_generate_with_fallback(prompt, provider):
    # Simple deterministic fake responses
    if isinstance(prompt, str) and prompt.lower().startswith("improve"):
        return {"response": f"Optimized prompt for {provider}"}
    return {"response": f"Response for {provider} to prompt: {str(prompt)[:40]}"}

fake_mod.generate_with_fallback = fake_generate_with_fallback
sys.modules["llm.fallback_manager"] = fake_mod

# Import the module under test
import benchmark.prompt_benchmark as pb

# Run the benchmark
res = pb.run_benchmark("Write a short summary of AI", {"tone": "concise"}, "groq")

print("RESULT_KEYS:", list(res.keys()))
print("best_prompt:", res.get("best_prompt"))
print("best_response:", res.get("best_response"))
print("winner_model:", res.get("winner_model"))
print("variants:", res.get("variants"))
print("benchmark_results:", res.get("benchmark_results"))

# Quick assertions (exit non-zero on failure)
required = ["best_prompt", "best_response", "winner_model"]
if not all(k in res for k in required):
    print("MISSING_REQUIRED_KEYS")
    sys.exit(2)

if not isinstance(res.get("variants"), list):
    print("VARIANTS_NOT_LIST")
    sys.exit(3)

print("SMOKE TEST OK")
sys.exit(0)
