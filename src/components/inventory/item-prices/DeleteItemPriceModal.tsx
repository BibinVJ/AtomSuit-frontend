'use client';

import { Modal } from '../../ui/modal';
import Button from '../../ui/button/Button';
import { toast } from 'sonner';
import { deleteItemPrice } from '../../../services/ItemPriceService';
import { ItemPrice } from '../../../types/ItemPrice';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  itemPrice: ItemPrice | null;
  force?: boolean;
}

export default function DeleteItemPriceModal({
  isOpen,
  onClose,
  onSuccess,
  itemPrice,
  force = false,
}: Props) {
  const handleDelete = async () => {
    if (!itemPrice) return;

    try {
      await deleteItemPrice(itemPrice.id, force);
      toast.success(force ? 'Price permanently deleted' : 'Price deleted successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting item price:', error);
      toast.error('Failed to delete item price');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-6">
      <div className="flex flex-col items-center text-center">
        <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Confirm Delete</h3>
        <p className="mb-6 text-gray-500 dark:text-gray-400">
          Are you sure you want to {force ? 'permanently ' : ''}delete the price for
          <span className="font-semibold text-gray-900 dark:text-white">
            {' '}
            {itemPrice?.item?.name}
          </span>
          ?
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
