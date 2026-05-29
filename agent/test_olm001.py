"""
test_plan:
  story_id: OLM-001
  framework: pytest
  tests:
    - id: TC-001
      file: "agent/test_olm001.py"
      maps_to_ac: "AC-1/AC-3: ollama/Dockerfile exists at the expected path"
      type: acceptance
    - id: TC-002
      file: "agent/test_olm001.py"
      maps_to_ac: "AC-3: Dockerfile uses official ollama/ollama base image"
      type: acceptance
    - id: TC-003
      file: "agent/test_olm001.py"
      maps_to_ac: "AC-1/AC-2: Dockerfile bakes in llama3.2:3b model weights"
      type: acceptance
    - id: TC-004
      file: "agent/test_olm001.py"
      maps_to_ac: "AC-3: Dockerfile contains no cloud credentials or API key references"
      type: acceptance
    - id: TC-005
      file: "agent/test_olm001.py"
      maps_to_ac: "AC-2: Dockerfile does not add a USER directive that blocks Ollama server"
      type: edge_case

Run from repo root or agent/ directory:
    pytest agent/test_olm001.py -v
"""

import os
import re

ROOT = os.path.join(os.path.dirname(__file__), "..")
DOCKERFILE_PATH = os.path.join(ROOT, "ollama", "Dockerfile")

# Strings whose presence indicates a credential leak
CREDENTIAL_PATTERNS = [
    "GROQ",
    "API_KEY",
    "api_key",
    "SECRET",
    "secret",
    "PASSWORD",
    "password",
    "TOKEN",
    "token",
]


# ── fixture ───────────────────────────────────────────────────────────────────

def _dockerfile_content() -> str:
    """Read and return Dockerfile content; raises FileNotFoundError if absent."""
    with open(DOCKERFILE_PATH) as fh:
        return fh.read()


# ── TC-001  file existence ────────────────────────────────────────────────────

def test_ollama_dockerfile_exists():
    """TC-001: ollama/Dockerfile must exist at repo_root/ollama/Dockerfile."""
    assert os.path.isfile(DOCKERFILE_PATH), (
        f"ollama/Dockerfile not found at {DOCKERFILE_PATH}"
    )


# ── TC-002  base image ────────────────────────────────────────────────────────

def test_dockerfile_uses_ollama_base_image():
    """TC-002: Dockerfile must use 'FROM ollama/ollama' as the base image."""
    content = _dockerfile_content()
    # Allow optional tag (e.g. ollama/ollama:latest) but require the official image.
    from_lines = [
        line.strip()
        for line in content.splitlines()
        if re.match(r"^\s*FROM\s+", line, re.IGNORECASE)
    ]
    assert from_lines, "Dockerfile contains no FROM instruction"
    # The first (or only) FROM must reference ollama/ollama
    assert any(
        re.match(r"FROM\s+ollama/ollama", line, re.IGNORECASE)
        for line in from_lines
    ), (
        f"Dockerfile FROM must be 'ollama/ollama' (with optional tag). "
        f"Found: {from_lines}"
    )


# ── TC-003  model baked in ────────────────────────────────────────────────────

def test_dockerfile_bakes_llama32_3b_model():
    """TC-003: Dockerfile must pull / reference llama3.2:3b at build time."""
    content = _dockerfile_content()
    assert "llama3.2:3b" in content, (
        "Dockerfile does not reference 'llama3.2:3b'; "
        "the model must be pulled during docker build"
    )


# ── TC-004  no credential strings ────────────────────────────────────────────

def test_dockerfile_contains_no_credentials():
    """TC-004: Dockerfile must not reference cloud API keys or credentials."""
    content = _dockerfile_content()
    found = [pat for pat in CREDENTIAL_PATTERNS if pat in content]
    assert not found, (
        f"Dockerfile contains credential-related strings: {found}. "
        "Remove all API keys, tokens, and secrets from the Dockerfile."
    )


# ── TC-005  no USER directive ────────────────────────────────────────────────

def test_dockerfile_does_not_switch_user():
    """TC-005: Dockerfile must not add a USER directive.

    The official ollama/ollama image runs as root and needs write access to
    /root/.ollama for model storage. A USER directive would break model
    serving at runtime.
    """
    content = _dockerfile_content()
    user_lines = [
        line.strip()
        for line in content.splitlines()
        if re.match(r"^\s*USER\s+", line, re.IGNORECASE)
    ]
    assert not user_lines, (
        f"Dockerfile must not contain a USER directive (Ollama needs root "
        f"to write model files). Found: {user_lines}"
    )
