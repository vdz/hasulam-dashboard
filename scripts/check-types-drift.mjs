import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const committed = readFileSync('src/lib/db/types.gen.ts', 'utf8');
const fresh = execFileSync('npx', ['supabase', 'gen', 'types', 'typescript', '--local', '--schema', 'public'], {
  encoding: 'utf8',
});

if (committed.trim() !== fresh.trim()) {
  console.error('src/lib/db/types.gen.ts is stale. Run `npm run db:types` and commit the result.');
  process.exit(1);
}
