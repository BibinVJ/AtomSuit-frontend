import ViewSale from '@/pages/Sales/ViewSale';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function ViewSalePage() {
  return (
    <ProtectedLayout>
      <ViewSale />
    </ProtectedLayout>
  );
}
