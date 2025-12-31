'use client';

import FormElements from '@/pages/Forms/FormElements';
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function FormElementsPage() {
  return (
    <ProtectedLayout>
      <FormElements />
    </ProtectedLayout>
  );
}
