import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { changePassword, sendChangePasswordOtp } from '@/services/AuthService';
import { Loader2, Lock, Send, KeyRound } from 'lucide-react';
import { User } from '@/types';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function ChangePasswordModal({ isOpen, onClose, user }: ChangePasswordModalProps) {
  const [formData, setFormData] = useState({
    otp: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        otp: '',
        new_password: '',
        new_password_confirmation: '',
      }));
      setErrors({});

      if (countdown === 0) {
        setOtpSent(false);
      } else {
        setOtpSent(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSendOtp = async () => {
    if (!user?.email && !user?.phone) {
      toast.error('No email or phone found to verify.');
      return;
    }
    const identifier = user.email || user.phone || '';

    setIsSendingOtp(true);
    setErrors({});
    try {
      await sendChangePasswordOtp(identifier);
      toast.success('Verification code sent to your registered email/phone.');
      setOtpSent(true);
      setCountdown(60); // 60 seconds cooldown
    } catch (error: unknown) {
      if (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).response?.data?.errors &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.keys((error as any).response.data.errors).length > 0
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setErrors((error as any).response.data.errors);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        toast.error((error as any).response?.data?.message || 'Failed to send verification code.');
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    if (formData.new_password !== formData.new_password_confirmation) {
      setErrors({ new_password_confirmation: 'Passwords do not match' });
      setIsLoading(false);
      return;
    }

    const identifier = user?.email || user?.phone || '';

    try {
      await changePassword({
        ...formData,
        identifier,
      });
      toast.success('Password changed successfully');
      setFormData({
        otp: '',
        new_password: '',
        new_password_confirmation: '',
      });
      setOtpSent(false);
      onClose();
    } catch (error: unknown) {
      console.error(error);
      if (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).response?.data?.errors &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.keys((error as any).response.data.errors).length > 0
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setErrors((error as any).response.data.errors);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        toast.error((error as any).response?.data?.message || 'Failed to change password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-5 lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
          Change Password
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="otp">Verification Code (OTP)</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="text"
                  name="otp"
                  id="otp"
                  placeholder="Enter 6-digit code"
                  value={formData.otp}
                  onChange={handleChange}
                  error={!!errors.otp}
                  leftIcon={<KeyRound className="w-5 h-5 text-gray-400" />}
                />
                {errors.otp && (
                  <p className="mt-1 text-xs text-error-500">
                    {Array.isArray(errors.otp) ? errors.otp[0] : errors.otp}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant={isSendingOtp || countdown > 0 ? 'outline' : 'primary'}
                onClick={handleSendOtp}
                disabled={isSendingOtp || countdown > 0}
                className="whitespace-nowrap min-w-[120px] h-11"
              >
                {isSendingOtp ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {otpSent ? 'Resend Code' : 'Send Code'}
                  </>
                )}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="new_password">New Password</Label>
            <Input
              type="password"
              name="new_password"
              id="new_password"
              placeholder="Enter new password"
              value={formData.new_password}
              onChange={handleChange}
              error={!!errors.new_password}
              hint={
                Array.isArray(errors.new_password) ? errors.new_password[0] : errors.new_password
              }
              leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
              disabled={!otpSent}
            />
          </div>
          <div>
            <Label htmlFor="new_password_confirmation">Confirm New Password</Label>
            <Input
              type="password"
              name="new_password_confirmation"
              id="new_password_confirmation"
              placeholder="Confirm new password"
              value={formData.new_password_confirmation}
              onChange={handleChange}
              error={!!errors.new_password_confirmation}
              hint={
                Array.isArray(errors.new_password_confirmation)
                  ? errors.new_password_confirmation[0]
                  : errors.new_password_confirmation
              }
              leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
              disabled={!otpSent}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button
              disabled={isLoading || !otpSent}
              type="submit"
              className="disabled:!bg-gray-300 disabled:!text-gray-500 disabled:!opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
