'use client';

import { Modal } from '../../ui/modal';
import Button from '../../ui/button/Button';
import { toast } from 'sonner';
import { deleteTaxGroup } from '@/services/TaxService';
import { TaxGroup } from '@/types';
import { isApiError } from '@/utils/errors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTaxGroupDeleted: () => void;
  taxGroup: TaxGroup;
  force?: boolean;
}

export default function DeleteTaxGroupModal({
  isOpen,
  onClose,
  onTaxGroupDeleted,
  taxGroup,
  force = false,
}: Props) {
  const handleDelete = async () => {
    try {
      await deleteTaxGroup(taxGroup.id, force);
      onTaxGroupDeleted();
      toast.success(force ? 'Tax group permanently deleted' : 'Tax group deleted successfully');
      onClose();
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.response?.data?.message || 'Failed to delete tax group');
      } else {
        console.error('Error deleting tax group:', error);
        toast.error('Failed to delete tax group');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 md:p-10">
      <div className="relative w-full">
        <div className="p-4 text-center">
          <div className="mx-auto mb-5 text-red-500 bg-red-100 rounded-full w-14 h-14 flex items-center justify-center">
            <svg
              className="w-10 h-10"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
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
            {force ? 'Permanently Delete Tax Group' : 'Delete Tax Group'}
          </h4>
          <p className="mb-6 text-gray-500 dark:text-gray-400">
            Are you sure you want to {force ? 'permanently ' : ''}delete the tax group &quot;
            {taxGroup?.name}&quot;?{' '}
            {force ? 'This action cannot be undone.' : 'You can restore it later from the trash.'}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              className="text-white bg-red-600 hover:bg-red-800 border-none"
              onClick={handleDelete}
            >
              {force ? 'Permanently Delete' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
