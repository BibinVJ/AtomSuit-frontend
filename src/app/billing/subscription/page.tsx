import BillingSubscription from '../../../pages/Billing/BillingSubscription';
import ProtectedLayout from '../../../components/layout/ProtectedLayout';

export default function BillingSubscriptionPage() {
  return (
    <ProtectedLayout>
      <BillingSubscription />
    </ProtectedLayout>
  );
}