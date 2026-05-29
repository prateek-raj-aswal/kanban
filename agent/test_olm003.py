"""
OLM-003: Remove GROQ_API_KEY from docker-compose.yml and add OLLAMA_BASE_URL.

Each test maps 1:1 to an acceptance criterion.
Run from the agent/ directory:
    pytest test_olm003.py -v
"""

import os
import pytest
import yaml

COMPOSE_PATH = os.path.join(os.path.dirname(__file__), "..", "docker-compose.yml")


@pytest.fixture(scope="module")
def compose() -> dict:
    with open(COMPOSE_PATH, "r") as fh:
        return yaml.safe_load(fh)


@pytest.fixture(scope="module")
def agent_env(compose: dict) -> dict:
    """Return the agent service environment as a normalised dict."""
    env = compose["services"]["agent"].get("environment", {})
    if isinstance(env, list):
        result = {}
        for entry in env:
            if "=" in str(entry):
                k, _, v = str(entry).partition("=")
                result[k] = v or None
            else:
                result[str(entry)] = None
        return result
    return dict(env)


# ---------------------------------------------------------------------------
# TC-OLM003-001  AC-1: No service has GROQ_API_KEY in its environment block
# ---------------------------------------------------------------------------
def test_no_service_has_groq_api_key(compose: dict):
    """GROQ_API_KEY must not appear under any service's environment."""
    for svc_name, svc in compose.get("services", {}).items():
        env = svc.get("environment", {})
        if isinstance(env, list):
            keys = []
            for entry in env:
                keys.append(str(entry).split("=")[0])
        else:
            keys = list(env.keys())
        assert "GROQ_API_KEY" not in keys, (
            f"Service '{svc_name}' still contains GROQ_API_KEY in its environment"
        )


# ---------------------------------------------------------------------------
# TC-OLM003-002  AC-2: agent environment contains OLLAMA_BASE_URL=http://ollama:11434
# ---------------------------------------------------------------------------
def test_agent_env_has_ollama_base_url(agent_env: dict):
    """agent.environment must have OLLAMA_BASE_URL pointing at the ollama service."""
    assert "OLLAMA_BASE_URL" in agent_env, (
        "OLLAMA_BASE_URL not found in agent environment"
    )
    assert agent_env["OLLAMA_BASE_URL"] == "http://ollama:11434", (
        f"Expected OLLAMA_BASE_URL='http://ollama:11434', got '{agent_env['OLLAMA_BASE_URL']}'"
    )


# ---------------------------------------------------------------------------
# TC-OLM003-003  AC-3: agent environment contains no key with GROQ in its name
# ---------------------------------------------------------------------------
def test_agent_env_has_no_groq_key(agent_env: dict):
    """No key in agent.environment may contain 'GROQ' (case-insensitive)."""
    groq_keys = [k for k in agent_env if "groq" in k.lower()]
    assert groq_keys == [], (
        f"agent environment still contains Groq-related keys: {groq_keys}"
    )


# ---------------------------------------------------------------------------
# TC-OLM003-004  AC-4: agent environment still contains BACKEND_URL=http://backend:8080
# ---------------------------------------------------------------------------
def test_agent_env_backend_url_unchanged(agent_env: dict):
    """BACKEND_URL must still be present and unchanged as a regression guard."""
    assert "BACKEND_URL" in agent_env, (
        "BACKEND_URL not found in agent environment"
    )
    assert agent_env["BACKEND_URL"] == "http://backend:8080", (
        f"Expected BACKEND_URL='http://backend:8080', got '{agent_env['BACKEND_URL']}'"
    )
