import AccountGroups from '@/pages/Accounting/AccountGroups';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function AccountGroupsPage() {
  return (
    <ProtectedLayout>
      <AccountGroups />
    </ProtectedLayout>
  );
}
