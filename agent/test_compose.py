"""
AGT-020: Verify that docker-compose.yml contains a correctly configured `agent` service.

Each test maps 1:1 to an acceptance criterion.
Run from the agent/ directory:
    pytest test_compose.py -v
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
def agent(compose: dict) -> dict:
    return compose["services"]["agent"]


# TC-NEW-1 — OLM-007: ollama service exists in docker-compose.yml
def test_ollama_service_exists_in_compose(compose: dict):
    assert "ollama" in compose.get("services", {}), (
        "Expected an 'ollama' key under services (added in OLM-002)"
    )


# TC-NEW-2 — OLM-007: GROQ_API_KEY absent from every service environment
def test_groq_api_key_absent_from_all_services(compose: dict):
    for svc_name, svc in compose.get("services", {}).items():
        env = svc.get("environment", {})
        if isinstance(env, dict):
            assert "GROQ_API_KEY" not in env, (
                f"Service '{svc_name}' still has GROQ_API_KEY in its environment"
            )
        elif isinstance(env, list):
            for entry in env:
                assert not str(entry).startswith("GROQ_API_KEY"), (
                    f"Service '{svc_name}' still has GROQ_API_KEY in its environment"
                )


# TC-001 — AC-1: docker-compose.yml contains an `agent` service
def test_agent_service_exists(compose: dict):
    assert "agent" in compose.get("services", {}), (
        "Expected an 'agent' key under services"
    )


# TC-002 — AC-2: Agent service builds from ./agent context
def test_agent_build_context(agent: dict):
    build = agent.get("build", {})
    # Accept either shorthand string or mapping form
    if isinstance(build, str):
        context = build
    else:
        context = build.get("context", "")
    assert context == "./agent", (
        f"Expected build.context './agent', got '{context}'"
    )


# TC-003 — AC-3: Agent depends on backend with condition service_healthy
def test_agent_depends_on_backend_healthy(agent: dict):
    depends = agent.get("depends_on", {})
    # depends_on can be a list or a mapping
    if isinstance(depends, list):
        assert "backend" in depends, "Expected 'backend' in depends_on"
        # List form cannot express condition — fail
        pytest.fail(
            "depends_on is a list; expected mapping with condition: service_healthy"
        )
    assert "backend" in depends, "Expected 'backend' key in depends_on mapping"
    condition = depends["backend"].get("condition")
    assert condition == "service_healthy", (
        f"Expected condition 'service_healthy', got '{condition}'"
    )


# TC-004 — AC-4: Agent exposes port 8001:8001
def test_agent_port_mapping(agent: dict):
    ports = agent.get("ports", [])
    # Ports entries may be strings ("8001:8001") or mappings
    port_strings = [str(p) for p in ports]
    assert "8001:8001" in port_strings, (
        f"Expected '8001:8001' in ports, got {ports}"
    )



# TC-006 — AC-6: BACKEND_URL uses the docker-compose internal hostname
def test_backend_url_uses_internal_hostname(agent: dict):
    env = agent.get("environment", {})
    expected_value = "http://backend:8080"
    if isinstance(env, list):
        key_entries = [e for e in env if str(e).startswith("BACKEND_URL")]
        assert key_entries, "BACKEND_URL not found in environment list"
        assert f"BACKEND_URL={expected_value}" in [str(e) for e in key_entries], (
            f"Expected 'BACKEND_URL={expected_value}', got {key_entries}"
        )
    else:
        assert "BACKEND_URL" in env, "BACKEND_URL not found in environment mapping"
        assert env["BACKEND_URL"] == expected_value, (
            f"Expected BACKEND_URL='{expected_value}', got '{env['BACKEND_URL']}'"
        )


# TC-007 — AC-7: Agent has a healthcheck targeting /health on port 8001
def test_agent_healthcheck_targets_health_endpoint(agent: dict):
    healthcheck = agent.get("healthcheck")
    assert healthcheck is not None, "Expected a healthcheck block on the agent service"
    test_cmd = healthcheck.get("test")
    assert test_cmd is not None, "healthcheck.test is missing"
    # test may be a list ["CMD", ...] or ["CMD-SHELL", "..."] or a plain string
    if isinstance(test_cmd, list):
        cmd_str = " ".join(str(t) for t in test_cmd)
    else:
        cmd_str = str(test_cmd)
    assert "8001" in cmd_str, (
        f"healthcheck.test must reference port 8001, got: {cmd_str}"
    )
    assert "/health" in cmd_str, (
        f"healthcheck.test must reference /health endpoint, got: {cmd_str}"
    )


# TC-008 — AC-8: No secrets or API key values hardcoded anywhere in the compose file
def test_no_hardcoded_secrets(compose: dict):
    """
    Serialize the parsed YAML back to a string and scan for patterns that
    indicate a hardcoded Groq/OpenAI-style key (e.g. 'gsk_', 'sk-').
    Also asserts that GROQ_API_KEY has no inline value across ALL services.
    """
    raw = yaml.dump(compose)

    # Common secret key prefixes for Groq / OpenAI style API keys
    forbidden_patterns = ["gsk_", "sk-groq", "sk-proj"]
    for pattern in forbidden_patterns:
        assert pattern not in raw, (
            f"Found a hardcoded secret matching pattern '{pattern}' in docker-compose.yml"
        )

    # Additionally verify GROQ_API_KEY has no value in any service
    for svc_name, svc in compose.get("services", {}).items():
        env = svc.get("environment", {})
        if isinstance(env, dict) and "GROQ_API_KEY" in env:
            assert env["GROQ_API_KEY"] is None, (
                f"Service '{svc_name}' has a hardcoded GROQ_API_KEY value"
            )
        elif isinstance(env, list):
            for entry in env:
                entry_str = str(entry)
                if entry_str.startswith("GROQ_API_KEY="):
                    suffix = entry_str[len("GROQ_API_KEY="):]
                    assert suffix == "", (
                        f"Service '{svc_name}' has a hardcoded GROQ_API_KEY: {entry}"
                    )
