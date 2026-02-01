import ResetPasswordForm from './_components/ResetPasswordForm';
import AuthLayout from '@/layout/AuthLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password | AtomSuit',
  description: 'Create a new password for your account',
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <ResetPasswordForm />
    </AuthLayout>
  );
}
