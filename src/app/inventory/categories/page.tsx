import Categories from '@/pages/Inventory/Categories';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function CategoriesPage() {
  return (
    <ProtectedLayout>
      <Categories />
    </ProtectedLayout>
  );
}
