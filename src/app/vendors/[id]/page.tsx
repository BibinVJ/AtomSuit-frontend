import ViewVendor from '@/pages/Vendor/ViewVendor';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function ViewVendorPage() {
  return (
    <ProtectedLayout>
      <ViewVendor />
    </ProtectedLayout>
  );
}
