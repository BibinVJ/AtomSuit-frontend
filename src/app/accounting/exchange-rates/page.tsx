import ExchangeRates from '@/pages/Accounting/ExchangeRates/ExchangeRates';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function ExchangeRatesPage() {
  return (
    <ProtectedLayout>
      <ExchangeRates />
    </ProtectedLayout>
  );
}
