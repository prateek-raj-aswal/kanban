"""
test_plan:
  story_id: OLM-006
  framework: pytest
  tests:
    - id: TC-OLM006-001
      file: agent/test_olm006.py
      maps_to_ac: "AC-1: GIVEN all .py files under agent/ are scanned for _groq_client, WHEN scan
        completes, THEN zero matches are found"
      type: acceptance
    - id: TC-OLM006-002
      file: agent/test_olm006.py
      maps_to_ac: "AC-3: GIVEN agent/ test files are scanned for GROQ_API_KEY used as an os.environ
        runtime requirement, WHEN scan completes, THEN zero matches are found"
      type: acceptance
    - id: TC-OLM006-003
      file: agent/test_olm006.py
      maps_to_ac: "AC-3: GIVEN agent/test_loop.py is read, WHEN searched for the function
        test_startup_fails_without_api_key, THEN it is not present"
      type: acceptance

Run from the agent/ directory:
    pytest test_olm006.py -v

These tests are written RED-first: they will FAIL until the implementation step
(OLM-006) removes all _groq_client references and the GROQ_API_KEY startup guard
from the existing test files.
"""

import os
import re

# ---------------------------------------------------------------------------
# Directory under test — resolved relative to this file so the tests work
# regardless of the cwd from which pytest is invoked.
# ---------------------------------------------------------------------------
AGENT_DIR = os.path.dirname(os.path.abspath(__file__))


_THIS_FILE = os.path.abspath(__file__)


def _py_files_under_agent():
    """Yield absolute paths of all .py files under AGENT_DIR, skipping __pycache__
    and this scan file itself."""
    for dirpath, dirnames, filenames in os.walk(AGENT_DIR):
        # Prune __pycache__ directories in-place so os.walk does not descend into them
        dirnames[:] = [d for d in dirnames if d != "__pycache__"]
        for fname in filenames:
            if not fname.endswith(".py"):
                continue
            full = os.path.join(dirpath, fname)
            if os.path.abspath(full) == _THIS_FILE:
                continue  # skip this scan file to avoid self-referential matches
            yield full


# ---------------------------------------------------------------------------
# TC-OLM006-001
# AC-1: zero occurrences of the string `_groq_client` across all agent .py files
# ---------------------------------------------------------------------------

def test_no_groq_client_references_in_agent_tests():
    """
    GIVEN all .py files under agent/ are scanned for the literal string '_groq_client',
    WHEN the scan completes,
    THEN zero matches are found in any file.
    """
    hits = []
    for path in _py_files_under_agent():
        with open(path, "r", encoding="utf-8") as fh:
            for lineno, line in enumerate(fh, start=1):
                if "_groq_client" in line:
                    rel = os.path.relpath(path, AGENT_DIR)
                    hits.append(f"{rel}:{lineno}: {line.rstrip()}")

    assert hits == [], (
        f"Found {len(hits)} occurrence(s) of '_groq_client' — "
        f"remove all Groq mock patches before this story is done:\n"
        + "\n".join(hits)
    )


# ---------------------------------------------------------------------------
# TC-OLM006-002
# AC-3: zero occurrences of GROQ_API_KEY used as a runtime os.environ requirement
#        inside test files (patterns: os.environ.*GROQ_API_KEY  or
#        pytest.raises.*GROQ_API_KEY)
# ---------------------------------------------------------------------------

_GROQ_KEY_REQUIREMENT_PATTERN = re.compile(
    r"(os\.environ[^#\n]*GROQ_API_KEY|pytest\.raises[^#\n]*GROQ_API_KEY)"
)


def test_no_groq_api_key_runtime_requirement_in_tests():
    """
    GIVEN all .py files under agent/ are scanned for patterns that assert or
      manipulate GROQ_API_KEY as a runtime os.environ requirement
      (os.environ.*GROQ_API_KEY  or  pytest.raises.*GROQ_API_KEY),
    WHEN the scan completes,
    THEN zero matches are found.
    """
    hits = []
    for path in _py_files_under_agent():
        with open(path, "r", encoding="utf-8") as fh:
            for lineno, line in enumerate(fh, start=1):
                if _GROQ_KEY_REQUIREMENT_PATTERN.search(line):
                    rel = os.path.relpath(path, AGENT_DIR)
                    hits.append(f"{rel}:{lineno}: {line.rstrip()}")

    assert hits == [], (
        f"Found {len(hits)} line(s) that still treat GROQ_API_KEY as a required "
        f"env var — remove them:\n" + "\n".join(hits)
    )


# ---------------------------------------------------------------------------
# TC-OLM006-003
# AC-3: test_loop.py must not contain the function test_startup_fails_without_api_key
# ---------------------------------------------------------------------------

TEST_LOOP_PATH = os.path.join(AGENT_DIR, "test_loop.py")


def test_startup_fails_without_api_key_is_removed_from_test_loop():
    """
    GIVEN agent/test_loop.py is read,
    WHEN its source text is searched for 'test_startup_fails_without_api_key',
    THEN the function definition is not present — it tested a RuntimeError guard
    that was removed in OLM-005 and must not remain as dead test code.
    """
    with open(TEST_LOOP_PATH, "r", encoding="utf-8") as fh:
        source = fh.read()

    assert "test_startup_fails_without_api_key" not in source, (
        "agent/test_loop.py still contains 'test_startup_fails_without_api_key'. "
        "This test guards a GROQ_API_KEY RuntimeError that no longer exists in "
        "main.py (removed in OLM-005) — delete the function."
    )
