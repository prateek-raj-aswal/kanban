"""
OLM-002: Verify that docker-compose.yml contains a correctly configured `ollama` service
and that the `agent` service depends on it correctly.

Each test maps 1:1 to an acceptance criterion.
Run from the repo root or agent/ directory:
    pytest agent/test_olm002.py -v
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
def ollama(compose: dict) -> dict:
    return compose["services"]["ollama"]


@pytest.fixture(scope="module")
def agent(compose: dict) -> dict:
    return compose["services"]["agent"]


# TC-001 — AC-1: ollama service exists under services
def test_ollama_service_exists(compose: dict):
    assert "ollama" in compose.get("services", {}), (
        "Expected an 'ollama' key under services"
    )


# TC-002 — AC-1: ollama service has build.context equal to ./ollama
def test_ollama_build_context(ollama: dict):
    build = ollama.get("build", {})
    if isinstance(build, str):
        context = build
    else:
        context = build.get("context", "")
    assert context == "./ollama", (
        f"Expected build.context './ollama', got '{context}'"
    )


# TC-003 — AC-2: ollama healthcheck references port 11434
def test_ollama_healthcheck_references_port_11434(ollama: dict):
    healthcheck = ollama.get("healthcheck")
    assert healthcheck is not None, "Expected a healthcheck block on the ollama service"
    test_cmd = healthcheck.get("test")
    assert test_cmd is not None, "healthcheck.test is missing"
    if isinstance(test_cmd, list):
        cmd_str = " ".join(str(t) for t in test_cmd)
    else:
        cmd_str = str(test_cmd)
    assert "11434" in cmd_str, (
        f"healthcheck.test must reference port 11434, got: {cmd_str}"
    )


# TC-004 — AC-3: agent depends_on includes ollama with condition: service_healthy
def test_agent_depends_on_ollama_healthy(agent: dict):
    depends = agent.get("depends_on", {})
    assert isinstance(depends, dict), (
        "agent depends_on must be a mapping (not a list) to express conditions"
    )
    assert "ollama" in depends, "Expected 'ollama' key in agent depends_on mapping"
    condition = depends["ollama"].get("condition")
    assert condition == "service_healthy", (
        f"Expected ollama condition 'service_healthy', got '{condition}'"
    )


# TC-005 — regression guard: agent depends_on still includes backend with condition: service_healthy
def test_agent_depends_on_backend_still_healthy(agent: dict):
    depends = agent.get("depends_on", {})
    assert isinstance(depends, dict), (
        "agent depends_on must be a mapping (not a list) to express conditions"
    )
    assert "backend" in depends, (
        "Regression: 'backend' was removed from agent depends_on"
    )
    condition = depends["backend"].get("condition")
    assert condition == "service_healthy", (
        f"Regression: backend condition changed — expected 'service_healthy', got '{condition}'"
    )
