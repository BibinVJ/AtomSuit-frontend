import ViewPurchase from '@/pages/Purchase/ViewPurchase';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function ViewPurchasePage() {
  return (
    <ProtectedLayout>
      <ViewPurchase />
    </ProtectedLayout>
  );
}
