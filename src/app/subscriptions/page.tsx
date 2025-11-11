import Subscriptions from '@/pages/Subscription/Subscriptions';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function SubscriptionsPage() {
  return (
    <ProtectedLayout>
      <Subscriptions />
    </ProtectedLayout>
  );
}
