import BillingPlans from '../../../pages/Billing/BillingPlans';
import ProtectedLayout from '../../../components/layout/ProtectedLayout';

export default function BillingPlansPage() {
  return (
    <ProtectedLayout>
      <BillingPlans />
    </ProtectedLayout>
  );
}