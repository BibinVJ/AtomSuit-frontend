import Vendors from '@/pages/Vendor/Vendors';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function VendorsPage() {
  return (
    <ProtectedLayout>
      <Vendors />
    </ProtectedLayout>
  );
}
