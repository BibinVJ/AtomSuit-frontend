import AddSale from '@/pages/Sales/AddSale';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function AddSalePage() {
  return (
    <ProtectedLayout>
      <AddSale />
    </ProtectedLayout>
  );
}
