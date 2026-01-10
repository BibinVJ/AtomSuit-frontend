import Currency from '@/pages/Accounting/Currency/Currency';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function CurrencyPage() {
  return (
    <ProtectedLayout>
      <Currency />
    </ProtectedLayout>
  );
}
