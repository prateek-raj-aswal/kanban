"""
AGT-021: Verify NEXT_PUBLIC_AGENT_URL is wired through .env files,
frontend Dockerfile, docker-compose build args, and agentApi.ts fallback.

Run from repo root or agent/ directory:
    pytest agent/test_agt021.py -v
"""

import os
import re
import yaml
import pytest

ROOT = os.path.join(os.path.dirname(__file__), "..")

ENV_EXAMPLE        = os.path.join(ROOT, ".env.example")
ENV_LOCAL_EXAMPLE  = os.path.join(ROOT, "frontend", ".env.local.example")
FRONTEND_DOCKERFILE = os.path.join(ROOT, "frontend", "Dockerfile")
COMPOSE_PATH       = os.path.join(ROOT, "docker-compose.yml")
AGENT_API_TS       = os.path.join(ROOT, "frontend", "src", "lib", "agentApi.ts")

EXPECTED_VAR  = "NEXT_PUBLIC_AGENT_URL"
EXPECTED_PORT = "8001"


# ── fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def compose() -> dict:
    with open(COMPOSE_PATH) as fh:
        return yaml.safe_load(fh)


@pytest.fixture(scope="module")
def dockerfile_lines() -> list[str]:
    with open(FRONTEND_DOCKERFILE) as fh:
        return fh.readlines()


@pytest.fixture(scope="module")
def agent_api_src() -> str:
    with open(AGENT_API_TS) as fh:
        return fh.read()


# ── TC-001  .env.example ──────────────────────────────────────────────────────

def test_env_example_contains_agent_url():
    with open(ENV_EXAMPLE) as fh:
        content = fh.read()
    assert EXPECTED_VAR in content, (
        f"{EXPECTED_VAR} not found in .env.example"
    )


def test_env_example_agent_url_uses_port_8001():
    with open(ENV_EXAMPLE) as fh:
        content = fh.read()
    match = re.search(rf"^{EXPECTED_VAR}=(.+)$", content, re.MULTILINE)
    assert match, f"{EXPECTED_VAR} has no value in .env.example"
    assert EXPECTED_PORT in match.group(1), (
        f"{EXPECTED_VAR} default in .env.example should reference port {EXPECTED_PORT}, "
        f"got: {match.group(1)}"
    )


# ── TC-002  frontend/.env.local.example ───────────────────────────────────────

def test_frontend_env_local_example_contains_agent_url():
    with open(ENV_LOCAL_EXAMPLE) as fh:
        content = fh.read()
    assert EXPECTED_VAR in content, (
        f"{EXPECTED_VAR} not found in frontend/.env.local.example"
    )


# ── TC-003  frontend/Dockerfile ARG ──────────────────────────────────────────

def test_dockerfile_has_arg_for_agent_url(dockerfile_lines):
    arg_lines = [l for l in dockerfile_lines if re.match(r"\s*ARG\s+NEXT_PUBLIC_AGENT_URL", l)]
    assert arg_lines, "frontend/Dockerfile is missing 'ARG NEXT_PUBLIC_AGENT_URL'"


# ── TC-004  frontend/Dockerfile ENV ──────────────────────────────────────────

def test_dockerfile_has_env_for_agent_url(dockerfile_lines):
    env_lines = [l for l in dockerfile_lines if re.match(r"\s*ENV\s+NEXT_PUBLIC_AGENT_URL", l)]
    assert env_lines, (
        "frontend/Dockerfile is missing 'ENV NEXT_PUBLIC_AGENT_URL=$NEXT_PUBLIC_AGENT_URL'"
    )


# ── TC-005  docker-compose.yml frontend build arg ─────────────────────────────

def test_compose_frontend_build_arg_contains_agent_url(compose):
    frontend = compose["services"]["frontend"]
    build_args = frontend.get("build", {}).get("args", {})
    if isinstance(build_args, list):
        keys = [a.split("=")[0] for a in build_args]
    else:
        keys = list(build_args.keys())
    assert EXPECTED_VAR in keys, (
        f"docker-compose.yml frontend build args missing {EXPECTED_VAR}; found: {keys}"
    )


# ── TC-006  agentApi.ts fallback port ─────────────────────────────────────────

def test_agent_api_fallback_uses_port_8001(agent_api_src):
    # The fallback/default URL in agentApi.ts must reference port 8001, not 8000
    assert "localhost:8001" in agent_api_src or "localhost:8001" in agent_api_src, (
        "agentApi.ts fallback URL should use port 8001 (agent runs on 8001)"
    )
    assert "localhost:8000" not in agent_api_src, (
        "agentApi.ts still has stale fallback 'localhost:8000'; update to 8001"
    )
