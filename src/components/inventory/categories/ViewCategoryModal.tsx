import { Category } from '../../../types';
import { Modal } from '../../ui/modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
}

export default function ViewCategoryModal({ isOpen, onClose, category }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
          Category Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <div className="col-span-full">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Name</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">{category.name}</p>
          </div>

          <div className="col-span-full">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">
              {category.description || '-'}
            </p>
          </div>

          <div className="col-span-full pt-4 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Accounting Defaults
            </h3>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Sales Account</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">
              {category.sales_account
                ? `${category.sales_account.code} - ${category.sales_account.name}`
                : '-'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">COGS Account</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">
              {category.cogs_account
                ? `${category.cogs_account.code} - ${category.cogs_account.name}`
                : '-'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Inventory Account</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">
              {category.inventory_account
                ? `${category.inventory_account.code} - ${category.inventory_account.name}`
                : '-'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Inventory Adjustment Account</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">
              {category.inventory_adjustment_account
                ? `${category.inventory_adjustment_account.code} - ${category.inventory_adjustment_account.name}`
                : '-'}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
