import { Suspense } from 'react';
import { SignInForm } from '@/components/SignInForm';
import { serverEnv } from '@/env';

type SearchParams = Promise<Record<string, string | undefined>>;

async function SignInWithNotice({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const notice = params.denied ? 'denied' : params.failed ? 'failed' : null;
  return <SignInForm devLoginEnabled={serverEnv().DEV_LOGIN_ENABLED} notice={notice} />;
}

export default function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={null}>
      <SignInWithNotice searchParams={searchParams} />
    </Suspense>
  );
}
