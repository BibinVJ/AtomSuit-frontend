import EditPurchase from '@/pages/Purchase/EditPurchase';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function EditPurchasePage() {
  return (
    <ProtectedLayout>
      <EditPurchase />
    </ProtectedLayout>
  );
}
