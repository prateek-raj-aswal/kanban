import os

# Set GROQ_API_KEY before any test module imports main.py.
# Tests mock the actual API call — no real Groq requests are made.
os.environ.setdefault("GROQ_API_KEY", "test-key-not-real-mocks-used-in-tests")
