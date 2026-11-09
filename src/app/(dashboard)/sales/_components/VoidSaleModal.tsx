'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { toast } from 'sonner';
import { voidSale } from '@/services/SaleService';
import { isApiError } from '@/utils/errors';
import { Sale } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaleVoided: () => void;
  sale: Sale;
}

export default function VoidSaleModal({ isOpen, onClose, onSaleVoided, sale }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVoid = async () => {
    setIsSubmitting(true);
    try {
      await voidSale(sale.id);
      toast.success('Sale voided successfully');
      onSaleVoided();
      onClose();
    } catch (error: unknown) {
      const message = isApiError(error) ? error.response?.data?.message : undefined;
      toast.error(message || 'Failed to void sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] lg:p-8">
      <div className="p-4">
        <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">Void Sale</h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Are you sure you want to void sale <strong>{sale.invoice_number}</strong>? This reverses
          its stock and ledger entries and cannot be undone.
        </p>
        <div className="flex items-center gap-3 lg:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Keep Sale
          </Button>
          <Button
            type="button"
            onClick={handleVoid}
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            Void Sale
          </Button>
        </div>
      </div>
    </Modal>
  );
}
