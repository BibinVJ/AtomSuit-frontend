import { User } from '@/types';
import { Pencil, Plus } from 'lucide-react';

interface UserAddressCardProps {
  user: User | null;
  onEdit: (addressType: string) => void;
}

export default function UserAddressCard({ user, onEdit }: UserAddressCardProps) {
  return (
    <div className="p-5 border border-gray-200 rounded-2xl custom-card-bg dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Addresses
          </h4>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {user?.addresses?.map((address) => (
              <div
                key={address.type}
                className="p-6 border border-gray-200 rounded-lg dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-semibold capitalize text-md dark:text-gray-300">
                    {address.type} Address
                  </h5>
                  <button
                    onClick={() => onEdit(address.type)}
                    className="flex items-center justify-center w-8 h-8 bg-white border-2 border-gray-300 rounded-full shadow-sm hover:bg-gray-50 hover:border-brand-400 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-brand-400"
                  >
                    <Pencil className="w-4 h-4 text-gray-600 hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-400" />
                  </button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {address.address_line_1}
                  </p>
                  {address.address_line_2 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {address.address_line_2}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {address.city}, {address.state}, {address.country} - {address.postal_code}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => onEdit('new')}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 border border-brand-300 text-white px-4 py-3 text-sm font-medium hover:bg-brand-600 hover:border-brand-400 transition-colors duration-200 lg:inline-flex lg:w-auto dark:bg-brand-500 dark:border-brand-600 dark:hover:bg-brand-400 dark:hover:border-brand-500"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </div>
    </div>
  );
}
