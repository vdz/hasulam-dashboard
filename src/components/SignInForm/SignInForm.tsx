import { text } from '@/assets/locales';
import { devSignInAction } from '@/app/signin/actions';
import styles from './SignInForm.module.css';
import type { SignInFormProps } from './types';

export function SignInForm({ devLoginEnabled, notice }: SignInFormProps) {
  return (
    <main className={styles.page} data-testid="sign-in">
      <h1 className={styles.title} data-testid="sign-in-title">{text.signIn.title}</h1>
      {notice !== null && <p className={styles.notice} data-testid="sign-in-notice" role="alert">{text.signIn[notice]}</p>}
      {devLoginEnabled ? (
        <form className={styles.form} action={devSignInAction} data-testid="sign-in-dev-form">
          <label className={styles.field}>
            {text.signIn.email}
            <input className={styles.input} data-testid="sign-in-email" name="email" type="email" required dir="ltr" />
          </label>
          <label className={styles.field}>
            {text.signIn.password}
            <input className={styles.input} data-testid="sign-in-password" name="password" type="password" required dir="ltr" />
          </label>
          <button className={styles.submit} data-testid="sign-in-submit" type="submit">{text.signIn.submit}</button>
        </form>
      ) : (
        <p className={styles.notice} data-testid="sign-in-google-soon">{text.signIn.googleSoon}</p>
      )}
    </main>
  );
}
