import React from 'react';
import Tooltip from '../ui/tooltip/Tooltip';
import { Edit, Trash, RotateCcw } from 'lucide-react';

interface TableActionsProps {
  isTrashed?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  editTooltip?: string;
  deleteTooltip?: string;
  restoreTooltip?: string;
}

export const TableActions: React.FC<TableActionsProps> = ({
  isTrashed = false,
  onEdit,
  onDelete,
  onRestore,
  editTooltip = 'Edit',
  deleteTooltip = 'Delete',
  restoreTooltip = 'Restore',
}) => {
  return (
    <div className="flex items-center justify-end gap-2">
      {!isTrashed ? (
        <>
          {onEdit && (
            <Tooltip text={editTooltip}>
              <button
                onClick={onEdit}
                className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Edit size={18} />
              </button>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip text={deleteTooltip}>
              <button
                onClick={onDelete}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
              >
                <Trash size={18} />
              </button>
            </Tooltip>
          )}
        </>
      ) : (
        <>
          {onRestore && (
            <Tooltip text={restoreTooltip}>
              <button
                onClick={onRestore}
                className="p-2 text-gray-500 hover:text-green-600 transition-colors"
              >
                <RotateCcw size={18} />
              </button>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip text="Permanently Delete">
              <button
                onClick={onDelete}
                className="p-2 text-gray-500 hover:text-red-700 transition-colors"
              >
                <Trash size={18} />
              </button>
            </Tooltip>
          )}
        </>
      )}
    </div>
  );
};

export default TableActions;
