"""
OLM-007: Meta-tests that verify test_compose.py has been updated for the new
Ollama topology.

Each test maps 1:1 to an acceptance criterion of OLM-007.
Run from the repo root:
    pytest agent/test_olm007.py -v

These are intentionally RED before OLM-007 implementation and GREEN after.
"""

import os
import subprocess
import sys

TEST_COMPOSE_PATH = os.path.join(os.path.dirname(__file__), "test_compose.py")


def _source() -> str:
    with open(TEST_COMPOSE_PATH, "r", encoding="utf-8") as fh:
        return fh.read()


# TC-OLM007-001 — AC-2 (part 1):
# test_compose.py must contain a test function that asserts the ollama service
# exists in the compose services dict.
def test_compose_has_ollama_service_assertion():
    source = _source()
    assert "test_ollama_service_exists" in source, (
        "test_compose.py is missing a test function named "
        "'test_ollama_service_exists' (or similar) that asserts "
        "the 'ollama' service is present in compose['services']"
    )


# TC-OLM007-002 — AC-2 (part 2):
# test_compose.py must contain a test function that asserts GROQ_API_KEY is
# absent from every service environment.
def test_compose_has_groq_api_key_absent_assertion():
    source = _source()
    assert "test_groq_api_key_absent_from_all_services" in source, (
        "test_compose.py is missing a test function named "
        "'test_groq_api_key_absent_from_all_services' that asserts "
        "GROQ_API_KEY does not appear in any service environment"
    )


# TC-OLM007-003 — AC-3:
# The old TC-005 function must NOT be present in test_compose.py.
def test_old_tc005_is_removed():
    source = _source()
    assert "test_groq_api_key_is_env_reference" not in source, (
        "test_compose.py still contains the old TC-005 function "
        "'test_groq_api_key_is_env_reference' — it must be removed"
    )


# TC-OLM007-004 — AC-1:
# Running pytest against test_compose.py must exit with code 0.
def test_compose_suite_passes():
    result = subprocess.run(
        [sys.executable, "-m", "pytest", TEST_COMPOSE_PATH, "-v", "--tb=short"],
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, (
        "pytest agent/test_compose.py did not exit 0.\n"
        f"stdout:\n{result.stdout}\n"
        f"stderr:\n{result.stderr}"
    )
