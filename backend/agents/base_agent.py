import logging
from abc import ABC, abstractmethod
from typing import Tuple
from llm.fallback_manager import generate_with_fallback

# Configure Logging basic output formats
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

class BaseAgent(ABC):
    def __init__(self, name: str, role: str, goal: str):
        self.name = name
        self.role = role
        self.goal = goal
        self.logger = logging.getLogger(self.name)
        self.logger.info(f"Initialized Agent | Role: {self.role} | Goal: {self.goal}")

    @abstractmethod
    def run(self, *args, **kwargs):
        """
        Execute agent main task logic triggers.
        Must be implemented by subclasses.
        """
        pass

    def _call_llm(self, prompt: str, provider: str = "groq") -> Tuple[str, str]:
        """
        Helper method to invoke the LLM client via fallback manager.
        Returns Tuple[response_content, provider_used].
        """
        self.logger.info(f"Invoking LLM [{provider}] for task execution via Fallback Manager...")
        try:
            result_dict = generate_with_fallback(prompt, provider)
            self.logger.info(f"LLM Response received using [{result_dict['provider_used']}].")
            return result_dict["response"], result_dict["provider_used"]
        except Exception as e:
            self.logger.error(f"Failed to execute LLM with fallback chain: {str(e)}")
            raise e
