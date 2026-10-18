import { execFileSync } from 'node:child_process';

const pattern = 'eslint-disable';
const out = (() => {
  try {
    return execFileSync('git', ['grep', '-n', pattern, '--', 'src', 'e2e', 'tests'], { encoding: 'utf8' });
  } catch {
    return '';
  }
})();

const today = new Date().toISOString().slice(0, 10);
const failures = out
  .split('\n')
  .filter(Boolean)
  .filter((line) => {
    const match = /--\s*.+\bexpires (\d{4}-\d{2}-\d{2})/.exec(line);
    return !match || (match[1] ?? '') < today;
  });

if (failures.length > 0) {
  console.error('Lint exceptions need "-- <reason> expires YYYY-MM-DD" and must not be expired:');
  console.error(failures.join('\n'));
  process.exit(1);
}
