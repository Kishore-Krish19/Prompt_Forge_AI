import requests
import json

def test_benchmark():
    url = "http://localhost:8000/benchmark"
    payload = {
        "prompt": "Write a hello world script in python",
        "requirements": {"language": "python", "task": "hello world"},
        "model": "groq"
    }
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))

if __name__ == "__main__":
    test_benchmark()
