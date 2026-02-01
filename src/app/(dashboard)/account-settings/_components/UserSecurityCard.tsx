import { Lock } from 'lucide-react';

interface UserSecurityCardProps {
  onChangePassword: () => void;
}

export default function UserSecurityCard({ onChangePassword }: UserSecurityCardProps) {
  return (
    <div className="p-5 border border-gray-200 rounded-2xl custom-card-bg dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Security</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg">
            Manage your password and security settings. We recommend using a strong, unique
            password.
          </p>
        </div>
        <button
          onClick={onChangePassword}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 transition-colors duration-200 lg:inline-flex lg:w-auto dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          <Lock size={18} />
          Change Password
        </button>
      </div>
    </div>
  );
}
