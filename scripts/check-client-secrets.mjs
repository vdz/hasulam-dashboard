// Fails if a server-only secret name or value reaches client code or the client bundle.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const envSrc = readFileSync('src/env.ts', 'utf8');
const names = [...envSrc.matchAll(/SERVER_SECRET_NAMES = \[([^\]]*)\]/g)].flatMap((m) => [...m[1].matchAll(/'([A-Z_]+)'/g)].map((x) => x[1]));
if (names.length === 0) throw new Error('SERVER_SECRET_NAMES not found in src/env.ts');
const values = names.map((n) => process.env[n]).filter((v) => typeof v === 'string' && v.length >= 8);

const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const problems = [];

for (const f of walk('src').filter((p) => /\.(ts|tsx)$/.test(p))) {
  const s = readFileSync(f, 'utf8');
  if (/^\s*['"]use client['"]/.test(s) && (/@\/env/.test(s) || names.some((n) => s.includes(n)))) problems.push(`${f}: client component references server env`);
  if (/NEXT_PUBLIC_[A-Z_]*(SECRET|SERVICE_ROLE|WEBHOOK|PASSWORD|PRIVATE)/.test(s)) problems.push(`${f}: secret-looking NEXT_PUBLIC_ var`);
}
if (existsSync('.next/static')) {
  for (const f of walk('.next/static').filter((p) => p.endsWith('.js'))) {
    const s = readFileSync(f, 'utf8');
    for (const n of names) if (s.includes(n)) problems.push(`${f}: client bundle contains ${n}`);
    for (const v of values) if (s.includes(v)) problems.push(`${f}: client bundle contains a server secret value`);
  }
} else if (process.argv.includes('--bundle')) problems.push('.next/static missing; run next build first');

if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`client-secrets: ok (${names.length} names checked)`);
