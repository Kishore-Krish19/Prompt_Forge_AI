from typing import Dict, List, Tuple
from agents.intent_agent import IntentAgent
from agents.requirement_agent import RequirementAgent
from agents.optimization_agent import OptimizationAgent
from agents.evaluation_agent import EvaluationAgent

class AgentOrchestrator:
    def __init__(self):
        # Instantiate Collaborate Agents
        self.intent_agent = IntentAgent()
        self.requirement_agent = RequirementAgent()
        self.optimization_agent = OptimizationAgent()
        self.evaluation_agent = EvaluationAgent()

    def analyze(self, prompt: str, provider: str = "groq") -> Tuple[str, List[str], str, int]:
        """
        Coordinates the analysis workflow logic nodes.
        1. Classify Intent
        2. Generate Clarification questions
        """
        # ADD THIS HERE: unpack token usage from each LLM call.
        intent, provider_intent, intent_tokens = self.intent_agent.run(prompt, provider)
        questions, provider_req, req_tokens = self.requirement_agent.run(prompt, intent, provider)
        token_usage = int(intent_tokens or 0) + int(req_tokens or 0)
        # MODIFY THIS LINE: include token_usage in orchestrator return.
        return intent, questions, provider_req, token_usage

    def optimize(self, prompt: str, requirements: Dict[str, str], provider: str = "groq") -> Tuple[str, str, int]:
        """
        Coordinates the optimization workflow logic nodes.
        """
        # ADD THIS HERE: receive token_usage from optimization call.
        optimized, provider_used, token_usage = self.optimization_agent.run(prompt, requirements, provider)
        # MODIFY THIS LINE: include token_usage in orchestrator return.
        return optimized, provider_used, token_usage

    def score(self, prompt: str, provider: str = "groq") -> Tuple[int, Dict[str, int], List[str], str, int]:
        """
        Coordinates the evaluation workflow logic nodes.
        """
        # ADD THIS HERE: receive token_usage from scoring call.
        rating, breakdown, suggestions, provider_used, token_usage = self.evaluation_agent.run(prompt, provider)
        # MODIFY THIS LINE: include token_usage in orchestrator return.
        return rating, breakdown, suggestions, provider_used, token_usage
