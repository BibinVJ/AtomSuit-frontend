import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { toast } from 'sonner';
import { deleteUser } from '@/services/UserService';
import { User } from '@/types/User';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUserDeleted: () => void;
  user: User;
  force?: boolean;
}

export default function DeleteUserModal({
  isOpen,
  onClose,
  onUserDeleted,
  user,
  force = false,
}: Props) {
  const handleDelete = async () => {
    try {
      await deleteUser(user.id, force);
      onUserDeleted();
      toast.success(force ? 'User permanently deleted' : 'User deleted successfully');
      onClose();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 md:p-10">
      <div className="relative w-full">
        <div className="p-4 text-center">
          <div className="mx-auto mb-5 text-red-500 bg-red-100 rounded-full w-14 h-14">
            <svg
              className="w-14 h-14"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              ></path>
            </svg>
          </div>
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {force ? 'Permanently Delete User' : 'Delete User'}
          </h4>
          <p className="mb-6 text-gray-500 dark:text-gray-400">
            Are you sure you want to {force ? 'permanently ' : ''}delete the user &quot;{user?.name}
            &quot;?{' '}
            {force ? 'This action cannot be undone.' : 'You can restore it later from the trash.'}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              className="text-white bg-red-600 hover:bg-red-800"
              onClick={handleDelete}
            >
              {force ? 'Permanently Delete' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
