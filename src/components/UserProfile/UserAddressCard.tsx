import { User } from "../../types";
import { PencilIcon, PlusIcon } from "../../icons";

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
                    className="flex items-center justify-center w-8 h-8 custom-secondary-btn rounded-full"
                  >
                    <PencilIcon className="w-4 h-4" />
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
                    {address.city}, {address.state}, {address.country} -{" "}
                    {address.postal_code}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => onEdit("new")}
          className="flex w-full items-center justify-center gap-2 rounded-full custom-primary-btn px-4 py-3 text-sm font-medium lg:inline-flex lg:w-auto"
        >
          <PlusIcon className="w-4 h-4" />
          Add New
        </button>
      </div>
    </div>
  );
}
