'use client';

import { useState } from 'react';
import { Modal } from '../../ui/modal';
import Button from '../../ui/button/Button';
import { toast } from 'sonner';
import { deleteWarehouse } from '../../../services/WarehouseService';
import { Warehouse } from '../../../types/Warehouse';
import { AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onWarehouseDeleted: () => void;
  warehouse: Warehouse;
}

export default function DeleteWarehouseModal({
  isOpen,
  onClose,
  onWarehouseDeleted,
  warehouse,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteWarehouse(warehouse.id);
      onWarehouseDeleted();
      toast.success('Warehouse deleted successfully');
      onClose();
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      toast.error('Failed to delete warehouse');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-6 md:p-10">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-red-100 rounded-full dark:bg-red-500/20">
            <AlertTriangle className="size-8 text-red-500" />
          </div>
        </div>

        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Delete Warehouse
        </h4>
        <p className="mb-6 text-gray-500 dark:text-gray-400">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-800 dark:text-white">{warehouse.name}</span>?
          This action can be undone later.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            className="bg-red-500 hover:bg-red-600 border-red-500"
            onClick={handleDelete}
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            Delete Warehouse
          </Button>
        </div>
      </div>
    </Modal>
  );
}
