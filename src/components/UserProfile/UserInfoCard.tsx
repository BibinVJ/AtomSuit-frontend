import { User } from "../../types";
import { formatDate } from "../../utils/date";
import { Pencil } from "lucide-react";

interface UserInfoCardProps {
  user: User | null;
  onEdit: () => void;
}

export default function UserInfoCard({ user, onEdit }: UserInfoCardProps) {
  return (
    <div className="p-5 border border-gray-200 rounded-2xl custom-card-bg dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-6 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Full Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.name}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.email}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.phone || "-"}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Alternate Email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.alternate_email || "-"}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Alternate Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.alternate_phone || "-"}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Date of Birth
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.dob ? formatDate(new Date(user.dob)) : "-"}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Gender
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.gender || "-"}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                ID Proof
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.id_proof_type} - {user?.id_proof_number}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 border border-brand-300 text-white px-4 py-3 text-sm font-medium hover:bg-brand-600 hover:border-brand-400 transition-colors duration-200 lg:inline-flex lg:w-auto dark:bg-brand-500 dark:border-brand-600 dark:hover:bg-brand-400 dark:hover:border-brand-500"
        >
          <Pencil size={18} />
          Edit
        </button>
      </div>
    </div>
  );
}
