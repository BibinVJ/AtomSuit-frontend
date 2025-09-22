import Sales from '@/pages/Sales/Sales';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function SalesPage() {
  return (
    <ProtectedLayout>
      <Sales />
    </ProtectedLayout>
  );
}
