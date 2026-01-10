import Currencies from '@/pages/Accounting/Currencies/Currencies';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function CurrenciesPage() {
  return (
    <ProtectedLayout>
      <Currencies />
    </ProtectedLayout>
  );
}
