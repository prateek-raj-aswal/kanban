"""
OLM-005: Rewrite agent/main.py to use Ollama instead of Groq.

Each test maps 1:1 to an acceptance criterion.
Run from the agent/ directory:
    pytest test_olm005.py -v

Tests are written to be RED against the current main.py (which still contains
Groq references and the RuntimeError guard) and GREEN after the required changes
are applied.
"""

import importlib
import os
import re
import sys
import types
from unittest.mock import MagicMock, patch

import pytest

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

MAIN_PY_PATH = os.path.join(os.path.dirname(__file__), "main.py")


def _load_main_with_env(**env_overrides):
    """
    Reload agent.main in an isolated environment.

    Temporarily sets env vars given in env_overrides (and removes any that are
    set to None), reloads the module, then restores the original env.

    Returns the reloaded module object.
    """
    # Save original module references so later tests can still patch them
    original_main = sys.modules.get("main")
    original_agent_main = sys.modules.get("agent.main")

    # Build a clean env snapshot
    saved = {}
    for key, val in env_overrides.items():
        saved[key] = os.environ.get(key)
        if val is None:
            os.environ.pop(key, None)
        else:
            os.environ[key] = val

    try:
        # Remove cached module so module-level code re-runs
        sys.modules.pop("main", None)
        sys.modules.pop("agent.main", None)

        # Ensure the agent directory is on sys.path
        agent_dir = os.path.dirname(os.path.abspath(__file__))
        if agent_dir not in sys.path:
            sys.path.insert(0, agent_dir)

        import main as m
        return m
    finally:
        # Restore original env
        for key, original_val in saved.items():
            if original_val is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = original_val
        # Restore original module references so patch("main.X") targets the right object
        if original_main is not None:
            sys.modules["main"] = original_main
        else:
            sys.modules.pop("main", None)
        if original_agent_main is not None:
            sys.modules["agent.main"] = original_agent_main
        else:
            sys.modules.pop("agent.main", None)


# ---------------------------------------------------------------------------
# TC-OLM005-001  AC-1: main.py source must contain zero occurrences of "groq"
# ---------------------------------------------------------------------------

def test_no_groq_in_main_py_source():
    """
    GIVEN main.py is read,
    WHEN the source text is scanned for the string 'groq' (case-insensitive),
    THEN no occurrence is found.
    """
    with open(MAIN_PY_PATH, "r", encoding="utf-8") as fh:
        source = fh.read()

    matches = re.findall(r"groq", source, flags=re.IGNORECASE)
    assert matches == [], (
        f"main.py still contains {len(matches)} occurrence(s) of 'groq' "
        f"(case-insensitive): {matches}"
    )


# ---------------------------------------------------------------------------
# TC-OLM005-002  AC-2: importing main with OLLAMA_BASE_URL unset must not raise RuntimeError
# ---------------------------------------------------------------------------

def test_import_without_env_does_not_raise():
    """
    GIVEN main.py is imported in a test with OLLAMA_BASE_URL unset,
    WHEN the module loads,
    THEN it does NOT raise RuntimeError.
    """
    try:
        module = _load_main_with_env(
            GROQ_API_KEY=None,       # explicitly absent
            OLLAMA_BASE_URL=None,    # explicitly absent — must use a safe default
        )
    except RuntimeError as exc:
        pytest.fail(
            f"main.py raised RuntimeError on import when OLLAMA_BASE_URL is unset: {exc}"
        )

    # Sanity: the module must have loaded an _ollama_client attribute
    assert hasattr(module, "_ollama_client"), (
        "main.py loaded without error but '_ollama_client' attribute is missing"
    )


# ---------------------------------------------------------------------------
# TC-OLM005-003  AC-3: _run_tool_loop returns content string on a non-tool-call completion
# ---------------------------------------------------------------------------

def test_run_tool_loop_returns_content_on_plain_completion():
    """
    GIVEN _run_tool_loop is called with a mocked _ollama_client.chat.completions.create,
    WHEN the mock returns a non-tool-call completion,
    THEN the function returns the content string.
    """
    # Load the module with a dummy OLLAMA_BASE_URL so it does not hit network
    main = _load_main_with_env(
        GROQ_API_KEY=None,
        OLLAMA_BASE_URL="http://localhost:11434",
    )

    # Build a minimal completion object that looks like an openai response
    fake_message = MagicMock()
    fake_message.tool_calls = None   # no tool calls
    fake_message.content = "Here is your answer."

    fake_choice = MagicMock()
    fake_choice.message = fake_message

    fake_completion = MagicMock()
    fake_completion.choices = [fake_choice]

    mock_create = MagicMock(return_value=fake_completion)

    with patch.object(main._ollama_client.chat.completions, "create", mock_create):
        result = main._run_tool_loop(
            messages=[{"role": "user", "content": "Hello"}],
            jwt="test-jwt-token",
        )

    assert result == "Here is your answer.", (
        f"_run_tool_loop should return the message content string, got: {result!r}"
    )
    mock_create.assert_called_once()
