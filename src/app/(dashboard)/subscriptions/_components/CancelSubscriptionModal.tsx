'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { toast } from 'sonner';
import { cancelSubscription } from '@/services/SubscriptionService';
import { isApiError } from '@/utils/errors';
import { Subscription } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubscriptionCanceled: () => void;
  subscription: Subscription;
}

export default function CancelSubscriptionModal({
  isOpen,
  onClose,
  onSubscriptionCanceled,
  subscription,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = async () => {
    setIsSubmitting(true);
    try {
      await cancelSubscription(subscription.id);
      toast.success('Subscription canceled successfully');
      onSubscriptionCanceled();
      onClose();
    } catch (error: unknown) {
      const message = isApiError(error) ? error.response?.data?.message : undefined;
      toast.error(message || 'Failed to cancel subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] lg:p-8">
      <div className="p-4">
        <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
          Cancel Subscription
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Are you sure you want to cancel the subscription <strong>{subscription.name}</strong>?
          Access continues until the end of the current billing period.
        </p>
        <div className="flex items-center gap-3 lg:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Keep Subscription
          </Button>
          <Button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            Cancel Subscription
          </Button>
        </div>
      </div>
    </Modal>
  );
}
