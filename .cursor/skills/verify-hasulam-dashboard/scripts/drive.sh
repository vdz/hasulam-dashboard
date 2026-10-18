#!/usr/bin/env bash
# Drives the my-tasks journey in Playwright against the running app; screenshots land in $EVIDENCE_DIR.
set -euo pipefail
cd "$(dirname "$0")/../../../.."
export EVIDENCE_DIR="${EVIDENCE_DIR:-/workspace/evidence}"
mkdir -p "$EVIDENCE_DIR"
E2E_BASE_URL=http://127.0.0.1:3000 npx playwright test "$@"
ls -l "$EVIDENCE_DIR"
