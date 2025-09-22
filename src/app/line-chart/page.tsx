import LineChart from '@/pages/Charts/LineChart';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function LineChartPage() {
  return (
    <ProtectedLayout>
      <LineChart />
    </ProtectedLayout>
  );
}
