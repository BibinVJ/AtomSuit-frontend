import Purchases from '@/pages/Purchase/Purchases';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function PurchasesPage() {
  return (
    <ProtectedLayout>
      <Purchases />
    </ProtectedLayout>
  );
}
