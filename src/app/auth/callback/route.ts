import { NextResponse, type NextRequest } from 'next/server';
import { completeSignIn } from '@/lib/db/viewer';
import { safeNextPath } from '@/lib/utils/redirect';

// Google -> Supabase -> here with ?code=. Exchange it for a session cookie, then go on.
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = request.nextUrl;
  const code = url.searchParams.get('code');
  const next = safeNextPath(url.searchParams.get('next'));
  const ok = code !== null && code.length > 0 && (await completeSignIn(code));
  return NextResponse.redirect(new URL(ok ? next : '/signin?failed=1', url.origin));
}
