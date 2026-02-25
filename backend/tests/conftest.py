from __future__ import annotations

import os
import shutil
import sys
import tempfile
from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = PROJECT_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

_TEST_DB_DIR = Path(tempfile.mkdtemp(prefix="devquest_tests_db_"))
os.environ["DB_PATH"] = str(_TEST_DB_DIR)
os.environ.setdefault("OPENAI_API_KEY", "")
os.environ.setdefault("LOG_LEVEL", "WARNING")

from app.main import app  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def cleanup_test_db() -> Generator[None, None, None]:
    yield
    shutil.rmtree(_TEST_DB_DIR, ignore_errors=True)


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as test_client:
        yield test_client
