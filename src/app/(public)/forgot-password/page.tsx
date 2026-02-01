import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import AuthLayout from '@/layout/AuthLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password | AtomSuit',
  description: 'Reset your AtomSuit password',
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
