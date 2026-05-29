"""
OLM-004: Remove GROQ_API_KEY from .env and .env.example.

Each test maps 1:1 to an acceptance criterion.
Run from the agent/ directory:
    pytest test_olm004.py -v
"""

import os
import re

ROOT = os.path.join(os.path.dirname(__file__), "..")
ENV_PATH = os.path.join(ROOT, ".env")
ENV_EXAMPLE_PATH = os.path.join(ROOT, ".env.example")
COMPOSE_PATH = os.path.join(ROOT, "docker-compose.yml")


# ---------------------------------------------------------------------------
# TC-OLM004-001  AC-1: .env must not contain GROQ_API_KEY
# ---------------------------------------------------------------------------
def test_env_has_no_groq_api_key():
    """GIVEN .env is read, WHEN contents are scanned, THEN GROQ_API_KEY does not appear."""
    with open(ENV_PATH, "r") as fh:
        content = fh.read()
    assert "GROQ_API_KEY" not in content, (
        ".env still contains GROQ_API_KEY — remove it before committing"
    )


# ---------------------------------------------------------------------------
# TC-OLM004-002  AC-2: .env.example must not contain GROQ_API_KEY
# ---------------------------------------------------------------------------
def test_env_example_has_no_groq_api_key():
    """GIVEN .env.example is read, WHEN contents are scanned, THEN GROQ_API_KEY does not appear."""
    with open(ENV_EXAMPLE_PATH, "r") as fh:
        content = fh.read()
    assert "GROQ_API_KEY" not in content, (
        ".env.example still contains GROQ_API_KEY"
    )


# ---------------------------------------------------------------------------
# TC-OLM004-003  AC-2 (comment guard): .env.example must contain no Groq reference at all
# ---------------------------------------------------------------------------
def test_env_example_has_no_groq_comment():
    """GIVEN .env.example is read, WHEN contents are scanned case-insensitively,
    THEN no reference to 'groq' exists (catches stray comments too)."""
    with open(ENV_EXAMPLE_PATH, "r") as fh:
        content = fh.read()
    assert not re.search(r"groq", content, re.IGNORECASE), (
        ".env.example still contains a Groq-related reference (key or comment)"
    )


# ---------------------------------------------------------------------------
# TC-OLM004-004  AC-3 (compose guard): docker-compose.yml must have no bare GROQ_API_KEY: reference
# ---------------------------------------------------------------------------
def test_compose_has_no_groq_api_key_reference():
    """GIVEN docker-compose.yml is read, WHEN contents are scanned,
    THEN there is no bare 'GROQ_API_KEY:' entry that would require the env var."""
    with open(COMPOSE_PATH, "r") as fh:
        content = fh.read()
    # Match 'GROQ_API_KEY:' as a YAML mapping key (the pattern that would cause
    # docker compose to warn about an undefined variable).
    assert not re.search(r"GROQ_API_KEY\s*:", content), (
        "docker-compose.yml still contains a GROQ_API_KEY: mapping — OLM-003 must be applied first"
    )
