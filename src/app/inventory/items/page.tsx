import Items from '@/pages/Inventory/Items';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function ItemsPage() {
  return (
    <ProtectedLayout>
      <Items />
    </ProtectedLayout>
  );
}
