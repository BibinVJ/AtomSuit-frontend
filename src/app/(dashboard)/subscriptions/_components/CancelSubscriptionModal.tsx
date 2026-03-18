import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { toast } from 'sonner';
import { cancelSubscription } from '@/services/SubscriptionService';
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
  const handleCancel = async () => {
    try {
      await cancelSubscription(subscription.id);
      onSubscriptionCanceled();
      toast.success('Subscription canceled successfully');
      onClose();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900">
        <div className="p-4 text-center">
          <div className="mx-auto mb-5 text-red-500 bg-red-100 rounded-full w-14 h-14">
            <svg
              className="w-14 h-14"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              ></path>
            </svg>
          </div>
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Cancel Subscription
          </h4>
          <p className="mb-6 text-gray-500 dark:text-gray-400">
            Are you sure you want to cancel the subscription &quot;{subscription?.name}&quot;?
            {subscription.is_on_grace_period
              ? ' The subscription will continue until the end of the billing period.'
              : ' This action cannot be undone.'}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              No, Keep It
            </Button>
            <Button
              type="button"
              className="text-white bg-red-600 hover:bg-red-800"
              onClick={handleCancel}
            >
              Yes, Cancel
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
