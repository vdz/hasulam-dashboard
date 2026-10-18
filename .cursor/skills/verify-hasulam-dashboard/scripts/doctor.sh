#!/usr/bin/env bash
# Read-only: is this instance worth driving?
set -uo pipefail
cd "$(dirname "$0")/../../../.."
ok=0
docker info >/dev/null 2>&1 && echo "docker: up" || { echo "docker: DOWN"; ok=1; }
npx supabase status >/dev/null 2>&1 && echo "supabase: up" || { echo "supabase: DOWN"; ok=1; }
n=$(psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -tAc "select count(*) from public.tasks where event_id='dev-feast-1'" 2>/dev/null \
  || node -e "const pg=require('pg');const c=new pg.Client('postgresql://postgres:postgres@127.0.0.1:54322/postgres');c.connect().then(()=>c.query(\"select count(*) from public.tasks where event_id='dev-feast-1'\")).then(r=>{console.log(r.rows[0].count);return c.end()}).catch(()=>console.log('?'))")
[ "$n" = "19" ] && echo "seed: 19 dev feast tasks" || { echo "seed: expected 19 dev feast tasks, got $n"; ok=1; }
pid=$(cat /tmp/verify-hasulam/app.pid 2>/dev/null || true)
if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then echo "app: our pid $pid"; else echo "app: not started by launch.sh"; ok=1; fi
code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/signin)
[ "$code" = "200" ] && echo "http: /signin 200" || { echo "http: /signin $code"; ok=1; }
grep -q 'DEV_LOGIN_ENABLED=true' .env.local 2>/dev/null && echo "dev login: enabled" || { echo "dev login: disabled"; ok=1; }
exit $ok
