import os
from dotenv import load_dotenv
from llm.groq_llm import GroqLLM

load_dotenv()

def check_base_url():
    with open('check_base_url_output.txt', 'w') as f:
        key = os.getenv("GROQ_API_KEY")
        llm = GroqLLM(api_key=key)
        if llm.client:
            f.write(f"Groq Client Base URL before generate: {llm.client.base_url}\n")
            try:
                # Call generate to trigger request
                response = llm.generate("Hello")
                f.write(f"Response: {response[:50]}\n")
            except Exception as e:
                f.write(f"Generate Error: {e}\n")
            f.write(f"Groq Client Base URL after generate: {llm.client.base_url}\n")
        else:
            f.write("Groq Client not initialized\n")

if __name__ == "__main__":
    check_base_url()
