import AddPurchase from '@/pages/Purchase/AddPurchase';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function AddPurchasePage() {
  return (
    <ProtectedLayout>
      <AddPurchase />
    </ProtectedLayout>
  );
}
