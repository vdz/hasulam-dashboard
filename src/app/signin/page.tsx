import { SignInForm } from '@/components/SignInForm';
import { serverEnv } from '@/env';

export const dynamic = 'force-dynamic';

export default async function SignInPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const notice = params.denied ? 'denied' : params.failed ? 'failed' : null;
  return <SignInForm devLoginEnabled={serverEnv().DEV_LOGIN_ENABLED} notice={notice} />;
}
