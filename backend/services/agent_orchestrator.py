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

    def analyze(self, prompt: str, provider: str = "groq") -> Tuple[str, List[str], str]:
        """
        Coordinates the analysis workflow logic nodes.
        1. Classify Intent
        2. Generate Clarification questions
        """
        intent, provider_intent = self.intent_agent.run(prompt, provider)
        questions, provider_req = self.requirement_agent.run(prompt, intent, provider)
        return intent, questions, provider_req

    def optimize(self, prompt: str, requirements: Dict[str, str], provider: str = "groq") -> Tuple[str, str]:
        """
        Coordinates the optimization workflow logic nodes.
        """
        optimized, provider_used = self.optimization_agent.run(prompt, requirements, provider)
        return optimized, provider_used

    def score(self, prompt: str, provider: str = "groq") -> Tuple[int, Dict[str, int], List[str], str]:
        """
        Coordinates the evaluation workflow logic nodes.
        """
        rating, breakdown, suggestions, provider_used = self.evaluation_agent.run(prompt, provider)
        return rating, breakdown, suggestions, provider_used
