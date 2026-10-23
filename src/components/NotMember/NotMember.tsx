import { text } from '@/assets/locales';
import { signOutAction } from '@/app/signin/actions';
import styles from './NotMember.module.css';
import type { NotMemberProps } from './types';

export function NotMember({ email }: NotMemberProps) {
  return (
    <main className={styles.page} data-testid="not-member">
      <h1 className={styles.title} data-testid="not-member-title">{text.notMember.title}</h1>
      <p className={styles.body}>
        {text.notMember.body} <bdi className={styles.email} dir="ltr" data-testid="not-member-email">{email}</bdi>
      </p>
      <p className={styles.body}>{text.notMember.hint}</p>
      <form action={signOutAction}>
        <button className={styles.signOut} data-testid="not-member-sign-out" type="submit">{text.notMember.switchAccount}</button>
      </form>
    </main>
  );
}
