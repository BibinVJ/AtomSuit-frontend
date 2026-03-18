'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  ArrowLeft,
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeClosed,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { sendResetOtp, resetPassword } from '@/services/AuthService';

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Identifier, 2: OTP + Password, 3: Success
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.identifier.trim()) {
      setErrors((prev) => ({ ...prev, identifier: 'Email or phone is required' }));
      return;
    }

    setIsLoading(true);
    try {
      await sendResetOtp(form.identifier);
      toast.success('OTP sent successfully.');
      setStep(2);
    } catch (err: unknown) {
      console.error(err);
      const message =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any).response?.data?.message || 'Failed to send OTP. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    let isValid = true;
    const newErrors = { ...errors };

    if (!form.otp || form.otp.length < 4) {
      newErrors.otp = 'OTP is required (min 4 chars)';
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
    if (!isValid) return;

    setIsLoading(true);
    try {
      await resetPassword({
        identifier: form.identifier,
        otp: form.otp,
        new_password: form.password,
        new_password_confirmation: form.password_confirmation,
      });
      toast.success('Password reset successfully!');
      setStep(3);
      setTimeout(() => router.push('/signin'), 2000);
    } catch (error: unknown) {
      console.error(error);
      const message =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).response?.data?.message || 'Failed to reset password. Check your OTP.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            {step === 1 && 'Forgot Password?'}
            {step === 2 && 'Reset Password'}
            {step === 3 && 'Success!'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {step === 1 && "Enter your email or phone number and we'll send you an OTP."}
            {step === 2 && 'Enter the OTP we sent you and set your new password.'}
            {step === 3 && 'Your password has been reset successfully. Redirecting...'}
          </p>
        </div>

        {step === 1 && (
          <form
            onSubmit={handleSendOtp}
            className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"
          >
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
                leftIcon={<Mail className="size-5 text-gray-400" />}
              />
            </div>

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form
            onSubmit={handleResetPassword}
            className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <div>
              <Label>Email or Phone</Label>
              <Input
                type="text"
                value={form.identifier}
                readOnly
                className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-70"
                leftIcon={<Mail className="size-5 text-gray-400" />}
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
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                error={!!errors.password}
                hint={errors.password}
                leftIcon={<Lock className="size-5 text-gray-400" />}
                rightIcon={
                  showPassword ? (
                    <Eye className="size-5 text-gray-400" />
                  ) : (
                    <EyeClosed className="size-5 text-gray-400" />
                  )
                }
                onRightIconClick={() => setShowPassword(!showPassword)}
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

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Start specific identifier?
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-6 animate-in fade-in zoom-in duration-300">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Redirecting to login...</p>
          </div>
        )}

        <div className="mt-5 text-center">
          <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
