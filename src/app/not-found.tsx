import Link from 'next/link';
import { text } from '@/assets/locales';

export default function NotFound() {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: 16 }} data-testid="not-found">
      <p>{text.events.notFound}</p>
      <Link href="/events">{text.events.back}</Link>
    </main>
  );
}
