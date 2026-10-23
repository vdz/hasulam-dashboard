import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { NotMember } from '@/components/NotMember';
import { viewerState } from '@/lib/db/viewer';

async function NotMemberForViewer() {
  const state = await viewerState();
  switch (state.kind) {
    case 'anonymous':
      redirect('/signin');
    // falls through: redirect() never returns
    case 'member':
      redirect('/');
    // falls through: redirect() never returns
    case 'not_member':
      return <NotMember email={state.email} />;
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}

export default function NotMemberPage() {
  return (
    <Suspense fallback={null}>
      <NotMemberForViewer />
    </Suspense>
  );
}
