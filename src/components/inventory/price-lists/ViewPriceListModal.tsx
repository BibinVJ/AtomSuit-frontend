import { Modal } from '../../ui/modal';
import Button from '../../ui/button/Button';
import { PriceList } from '../../../types/PriceList';
import Label from '../../form/Label';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  priceList: PriceList | null;
}

export default function ViewPriceListModal({ isOpen, onClose, priceList }: Props) {
  if (!priceList) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Price List Details</h3>
          <p className="text-sm text-gray-500">View detailed information about the price list.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Name</Label>
            <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
              {priceList.name}
            </div>
          </div>

          <div>
            <Label>Code</Label>
            <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
              {priceList.code}
            </div>
          </div>

          <div>
            <Label>Type</Label>
            <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white capitalize">
              {priceList.type}
            </div>
          </div>

          <div>
            <Label>Currency</Label>
            <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
              {priceList.currency?.code} - {priceList.currency?.name} ({priceList.currency?.symbol})
            </div>
          </div>

          <div>
            <Label>Tax Inclusive</Label>
            <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
              {priceList.is_tax_inclusive ? 'Yes' : 'No'}
            </div>
          </div>

          <div className="md:col-span-2">
            <Label>Description</Label>
            <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
              {priceList.description || 'N/A'}
            </div>
          </div>

          {priceList.created_at && (
            <div>
              <Label>Created At</Label>
              <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {new Date(priceList.created_at).toLocaleString()}
              </div>
            </div>
          )}
          {priceList.updated_at && (
            <div>
              <Label>Updated At</Label>
              <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {new Date(priceList.updated_at).toLocaleString()}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
