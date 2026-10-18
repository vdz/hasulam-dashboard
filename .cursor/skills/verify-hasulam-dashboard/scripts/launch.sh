#!/usr/bin/env bash
# Starts Docker (The Lab), local Supabase, and the production build on :3000.
set -euo pipefail
cd "$(dirname "$0")/../../../.."
RUN=/tmp/verify-hasulam
mkdir -p "$RUN"

if ! docker info >/dev/null 2>&1; then
  pgrep -x dockerd >/dev/null || (sudo nohup dockerd >"$RUN/dockerd.log" 2>&1 &)
  for _ in $(seq 30); do docker info >/dev/null 2>&1 && break; sleep 1; done
  sudo chmod 666 /var/run/docker.sock
fi
# The Lab has legacy iptables with FORWARD DROP; without these, containers can't reach each other.
for dir in -i -o; do
  sudo iptables-legacy -C DOCKER-USER "$dir" br+ -j ACCEPT 2>/dev/null || sudo iptables-legacy -I DOCKER-USER "$dir" br+ -j ACCEPT 2>/dev/null || true
done

npx supabase status >/dev/null 2>&1 || npm run db:start
npx supabase db reset

KEY=$(npx supabase status -o env | grep '^ANON_KEY=' | cut -d'"' -f2)
printf 'NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321\nNEXT_PUBLIC_SUPABASE_ANON_KEY=%s\nDEV_LOGIN_ENABLED=true\n' "$KEY" > .env.local

if ss -ltn 'sport = :3000' | grep -q LISTEN; then
  echo "port 3000 already in use; run cleanup.sh or doctor.sh first" >&2
  exit 1
fi
npm run build >"$RUN/build.log" 2>&1
setsid nohup npm run start >"$RUN/app.log" 2>&1 &
echo $! > "$RUN/app.pid"
for _ in $(seq 60); do
  curl -fsS -o /dev/null http://127.0.0.1:3000/signin && { echo "READY http://127.0.0.1:3000"; exit 0; }
  sleep 1
done
echo "app did not become ready; see $RUN/app.log" >&2
exit 1
