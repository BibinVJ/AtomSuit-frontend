import ChartOfAccounts from '@/pages/Accounting/ChartOfAccounts';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function ChartOfAccountsPage() {
  return (
    <ProtectedLayout>
      <ChartOfAccounts />
    </ProtectedLayout>
  );
}
