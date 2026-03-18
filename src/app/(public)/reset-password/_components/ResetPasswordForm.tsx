'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowLeft, KeyRound, Lock } from 'lucide-react';
import { toast } from 'sonner';

import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import { resetPassword } from '@/services/AuthService';

import Label from '@/components/form/Label';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifierFromUrl = searchParams.get('identifier') || '';

  const [form, setForm] = useState({
    identifier: '',
    otp: '',
    password: '',
    password_confirmation: '',
  });

  const [errors, setErrors] = useState({
    identifier: '',
    otp: '',
    password: '',
    password_confirmation: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (identifierFromUrl) {
      setForm((prev) => ({ ...prev, identifier: identifierFromUrl }));
    }
  }, [identifierFromUrl]);

  const validate = () => {
    const newErrors = { identifier: '', otp: '', password: '', password_confirmation: '' };
    let isValid = true;

    if (!form.identifier) {
      newErrors.identifier = 'Email or phone is required';
      isValid = false;
    }
    if (!form.otp || form.otp.length < 4) {
      newErrors.otp = 'OTP must be at least 4 characters';
      isValid = false;
    }
    if (!form.password || form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }
    if (form.password !== form.password_confirmation) {
      newErrors.password_confirmation = "Passwords don't match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await resetPassword({
        identifier: form.identifier,
        otp: form.otp,
        new_password: form.password,
        new_password_confirmation: form.password_confirmation,
      });
      toast.success('Password reset successfully. Please login with your new password.');
      router.push('/signin');
    } catch (error: unknown) {
      console.error(error);
      const message =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).response?.data?.message ||
        'Failed to reset password. Please check your OTP.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Reset Password
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter the OTP sent to your email/phone and your new password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Email or Phone</Label>
          <Input
            type="text"
            name="identifier"
            placeholder="Enter email or phone"
            value={form.identifier}
            onChange={handleChange}
            error={!!errors.identifier}
            hint={errors.identifier}
            readOnly={!!identifierFromUrl}
            className={!!identifierFromUrl ? 'bg-gray-50 dark:bg-gray-800 cursor-not-allowed' : ''}
          />
        </div>

        <div>
          <Label>OTP Code</Label>
          <Input
            type="text"
            name="otp"
            placeholder="Enter OTP"
            value={form.otp}
            onChange={handleChange}
            error={!!errors.otp}
            hint={errors.otp}
            leftIcon={<KeyRound className="size-5 text-gray-400" />}
          />
        </div>

        <div>
          <Label>New Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            error={!!errors.password}
            hint={errors.password}
            leftIcon={<Lock className="size-5 text-gray-400" />}
          />
        </div>

        <div>
          <Label>Confirm Password</Label>
          <Input
            type="password"
            name="password_confirmation"
            placeholder="••••••••"
            value={form.password_confirmation}
            onChange={handleChange}
            error={!!errors.password_confirmation}
            hint={errors.password_confirmation}
            leftIcon={<Lock className="size-5 text-gray-400" />}
          />
        </div>

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            'Reset Password'
          )}
        </Button>
      </form>

      <div className="text-center">
        <Link
          href="/signin"
          className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
