import Taxes from '@/pages/Accounting/Taxes/Taxes';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function TaxesPage() {
  return (
    <ProtectedLayout>
      <Taxes />
    </ProtectedLayout>
  );
}
