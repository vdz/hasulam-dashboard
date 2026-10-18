#!/usr/bin/env bash
# Stops what launch.sh started. Evidence in $EVIDENCE_DIR (default /workspace/evidence) is kept.
set -uo pipefail
cd "$(dirname "$0")/../../../.."
pid=$(cat /tmp/verify-hasulam/app.pid 2>/dev/null || true)
if [ -n "$pid" ]; then
  kill -TERM -- "-$pid" 2>/dev/null || kill "$pid" 2>/dev/null
  rm -f /tmp/verify-hasulam/app.pid
fi
npx supabase stop --no-backup
echo "evidence kept in ${EVIDENCE_DIR:-/workspace/evidence}"
