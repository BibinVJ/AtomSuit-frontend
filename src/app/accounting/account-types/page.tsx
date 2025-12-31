import AccountTypes from '@/pages/Accounting/AccountTypes';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function AccountTypesPage() {
  return (
    <ProtectedLayout>
      <AccountTypes />
    </ProtectedLayout>
  );
}
