"""
AGT-022: Verify agent/requirements.txt exists with pinned deps, and that
the Dockerfile installs from it rather than via an inline package list.

Run from repo root:
    pytest agent/test_agt022.py -v
"""

import os
import re
import pytest

ROOT = os.path.join(os.path.dirname(__file__), "..")
REQUIREMENTS = os.path.join(ROOT, "agent", "requirements.txt")
DOCKERFILE   = os.path.join(ROOT, "agent", "Dockerfile")

EXPECTED_PACKAGES = {
    "fastapi":          "0.115.12",
    "uvicorn":          "0.34.3",
    "httpx":            "0.27.2",
    "openai":           "1.57.0",
    "pydantic":         "2.13.4",
}


# ── fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def requirements_lines() -> list[str]:
    with open(REQUIREMENTS) as fh:
        return [l.strip() for l in fh if l.strip() and not l.startswith("#")]


@pytest.fixture(scope="module")
def dockerfile_text() -> str:
    with open(DOCKERFILE) as fh:
        return fh.read()


# ── TC-001 — requirements.txt exists ─────────────────────────────────────────

def test_requirements_file_exists():
    assert os.path.isfile(REQUIREMENTS), "agent/requirements.txt does not exist"


# ── TC-002 — all 4 packages present with pinned versions ─────────────────────

@pytest.mark.parametrize("pkg,version", EXPECTED_PACKAGES.items())
def test_package_pinned(pkg, version, requirements_lines):
    # Match "pkg==version" or "pkg[extra]==version"
    pattern = re.compile(rf"^{re.escape(pkg)}(\[.+\])?=={re.escape(version)}$", re.IGNORECASE)
    matched = [l for l in requirements_lines if pattern.match(l)]
    assert matched, (
        f"requirements.txt: expected '{pkg}=={version}', not found. Lines: {requirements_lines}"
    )


# ── TC-003 — every line is pinned with == (no floating deps) ─────────────────

def test_all_deps_pinned(requirements_lines):
    unpinned = [l for l in requirements_lines if "==" not in l]
    assert not unpinned, (
        f"requirements.txt has unpinned dependencies: {unpinned}"
    )


# ── TC-004 — Dockerfile COPYs requirements.txt ───────────────────────────────

def test_dockerfile_copies_requirements(dockerfile_text):
    assert "requirements.txt" in dockerfile_text, (
        "Dockerfile does not reference requirements.txt in any COPY instruction"
    )


# ── TC-005 — Dockerfile uses pip install -r requirements.txt ─────────────────

def test_dockerfile_uses_requirements_flag(dockerfile_text):
    assert "-r requirements.txt" in dockerfile_text, (
        "Dockerfile must use 'pip install -r requirements.txt', not an inline package list"
    )


# ── TC-006 — Dockerfile no longer has inline package names in pip install ─────

def test_dockerfile_no_inline_pip_packages(dockerfile_text):
    # The old inline install listed fastapi, uvicorn, httpx, openai as args to pip install
    inline_pattern = re.compile(
        r"pip install[^\n]*(?:fastapi|uvicorn|httpx|openai)[^\n]*\n", re.IGNORECASE
    )
    # It's only a problem if the inline list is NOT followed by -r (i.e., it's still hardcoded)
    bad_lines = [
        m.group(0).strip()
        for m in inline_pattern.finditer(dockerfile_text)
        if "-r " not in m.group(0)
    ]
    assert not bad_lines, (
        f"Dockerfile still has inline pip packages (should use -r requirements.txt): {bad_lines}"
    )
