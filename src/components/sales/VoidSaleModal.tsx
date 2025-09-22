import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import { toast } from 'sonner';
import { voidSale } from '../../services/SaleService';

import { Sale } from '../../types';
import { isApiError } from '../../utils/errors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaleVoided: () => void;
  sale: Sale;
}

export default function VoidSaleModal({ isOpen, onClose, onSaleVoided, sale }: Props) {

  const handleVoid = async () => {
    try {
      await voidSale(sale.id);
      onSaleVoided();
      toast.success('Sale voided successfully');
      onClose();
    } catch (error: unknown) {
      if (isApiError(error) && error.response?.status === 409) {
        toast.error(error.response?.data?.message);
      } else {
        console.error('Error voiding sale:', error);
        toast.error('Failed to void sale');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900">
        <div className="p-4 text-center">
          <div className="mx-auto mb-5 text-red-500 bg-red-100 rounded-full w-14 h-14">
            <svg
              className="w-14 h-14"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              ></path>
            </svg>
          </div>
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Void Sale
          </h4>
          <p className="mb-6 text-gray-500 dark:text-gray-400">
            Are you sure you want to void the sale "{sale?.invoice_number}"? This action cannot be undone.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              className="text-white bg-red-600 hover:bg-red-800"
              onClick={handleVoid}
            >
              Void Sale
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}