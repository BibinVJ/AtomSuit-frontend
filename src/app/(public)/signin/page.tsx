import { Suspense } from 'react';
import { Metadata } from 'next';
import SignIn from './_components/SignInForm';
import AuthLayout from '@/layout/AuthLayout';

export const metadata: Metadata = {
  title: 'Atom Suit - Sign In',
  description: 'Sign in to your Atom Suit account',
};

export default function SignInPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <SignIn />
      </Suspense>
    </AuthLayout>
  );
}
