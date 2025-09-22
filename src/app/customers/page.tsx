import Customers from '@/pages/Customer/Customers';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function CustomersPage() {
  return (
    <ProtectedLayout>
      <Customers />
    </ProtectedLayout>
  );
}
