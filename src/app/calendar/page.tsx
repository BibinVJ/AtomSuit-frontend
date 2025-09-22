import Calendar from '@/pages/Calendar';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function CalendarPage() {
  return (
    <ProtectedLayout>
      <Calendar />
    </ProtectedLayout>
  );
}
