import PriceLists from '@/pages/Inventory/PriceLists';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export const metadata = {
  title: 'Price Lists | AtomSuit',
  description: 'Manage price lists',
};

export default function PriceListsPage() {
  return (
    <ProtectedLayout>
      <PriceLists />
    </ProtectedLayout>
  );
}
