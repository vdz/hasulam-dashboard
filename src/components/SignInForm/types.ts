export interface SignInFormProps {
  devLoginEnabled: boolean;
  notice: 'failed' | 'denied' | null;
  next: string;
}
