import EditSale from '@/pages/Sales/EditSale';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function EditSalePage() {
  return (
    <ProtectedLayout>
      <EditSale />
    </ProtectedLayout>
  );
}
