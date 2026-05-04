import { Warehouse } from '@/types/Warehouse';
import { Modal } from '@/components/ui/modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  warehouse: Warehouse;
}

export default function ViewWarehouseModal({ isOpen, onClose, warehouse }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
          Warehouse Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Basic Info */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 border-b pb-2 border-gray-100 dark:border-gray-800">
              Basic Information
            </h3>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Name</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">{warehouse.name}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Code</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">{warehouse.code || '-'}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">{warehouse.email || '-'}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">{warehouse.phone || '-'}</p>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">
              {warehouse.description || '-'}
            </p>
          </div>

          {/* Location Info */}
          <div className="md:col-span-2 mt-2">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 border-b pb-2 border-gray-100 dark:border-gray-800">
              Location Details
            </h3>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Address Line 1</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">
              {warehouse.address_line_1 || '-'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Address Line 2</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">
              {warehouse.address_line_2 || '-'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">City</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">{warehouse.city || '-'}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">State</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">{warehouse.state || '-'}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Country</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">{warehouse.country || '-'}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Zip Code</h3>
            <p className="text-base text-gray-900 dark:text-gray-100">
              {warehouse.zip_code || '-'}
            </p>
          </div>

          {/* Stock Info */}
          <div className="md:col-span-2 mt-2">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 border-b pb-2 border-gray-100 dark:border-gray-800">
              Stock Information
            </h3>

            {warehouse.stock_by_item && warehouse.stock_by_item.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                {warehouse.stock_by_item.map((itemStock) => (
                  <div
                    key={itemStock.id}
                    className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700"
                  >
                    <h4
                      className="text-sm font-medium text-gray-500 mb-1 truncate"
                      title={itemStock.name}
                    >
                      {itemStock.name}
                    </h4>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {itemStock.quantity}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No stock information available.</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
