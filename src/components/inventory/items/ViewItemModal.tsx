import { Item } from '../../../types';
import { Modal } from '../../ui/modal';
import { useSettings } from '../../../hooks/useSettings';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: Item;
}

export default function ViewItemModal({ isOpen, onClose, item }: Props) {
  const { formatCurrency } = useSettings();

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Item Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Basic Info */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 border-b pb-2 border-gray-100 dark:border-gray-800">
              Basic Information
            </h3>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">SKU</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">{item.sku}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Name</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">{item.name}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Type</h3>
            <p className="text-base text-gray-900 dark:text-gray-100 capitalize">{item.type}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">
              {item.category?.name || '-'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Unit</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">
              {item.unit ? `${item.unit.name} (${item.unit.code})` : '-'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Tax Group</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">
              {item.tax_group ? item.tax_group.name : '-'}
            </p>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">{item.description || '-'}</p>
          </div>

          {/* Accounting Info */}
          <div className="md:col-span-2 mt-2">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 border-b pb-2 border-gray-100 dark:border-gray-800">
              Accounting Details
            </h3>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Sales Account</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">
              {item.sales_account ? `${item.sales_account.code} - ${item.sales_account.name}` : '-'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">COGS Account</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">
              {item.cogs_account ? `${item.cogs_account.code} - ${item.cogs_account.name}` : '-'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Inventory Account</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">
              {item.inventory_account
                ? `${item.inventory_account.code} - ${item.inventory_account.name}`
                : '-'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Inventory Adjustment Account</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">
              {item.inventory_adjustment_account
                ? `${item.inventory_adjustment_account.code} - ${item.inventory_adjustment_account.name}`
                : '-'}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
