from abc import ABC, abstractmethod

class BaseLLM(ABC):
    @abstractmethod
    def generate(self, prompt: str, **kwargs) -> str:
        """
        Generate response text from prompt instruction.
        Must be implemented by subclasses.
        """
        pass
