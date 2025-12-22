import ViewCustomer from '@/pages/Customer/ViewCustomer';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function ViewCustomerPage() {
  return (
    <ProtectedLayout>
      <ViewCustomer />
    </ProtectedLayout>
  );
}
