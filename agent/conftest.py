import os

# Set OLLAMA_BASE_URL before any test module imports main.py.
# Tests mock the actual LLM call — no real Ollama requests are made.
os.environ.setdefault("OLLAMA_BASE_URL", "http://localhost:11434")
