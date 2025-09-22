import BarChart from '@/pages/Charts/BarChart';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function BarChartPage() {
  return (
    <ProtectedLayout>
      <BarChart />
    </ProtectedLayout>
  );
}
