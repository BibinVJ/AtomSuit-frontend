import BasicTables from '@/pages/Tables/BasicTables';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function BasicTablesPage() {
  return (
    <ProtectedLayout>
      <BasicTables />
    </ProtectedLayout>
  );
}
