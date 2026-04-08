import React from 'react';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import { Edit, Trash, RotateCcw, Eye } from 'lucide-react';
import Button from '@/components/ui/button/Button';

interface TableActionsProps {
  isTrashed?: boolean;
  onView?: () => void;
  viewHref?: string;
  onEdit?: () => void;
  editHref?: string;
  onDelete?: () => void;
  onRestore?: () => void;
  viewTooltip?: string;
  editTooltip?: string;
  deleteTooltip?: string;
  restoreTooltip?: string;
  customActions?: React.ReactNode;
}

export const TableActions: React.FC<TableActionsProps> = ({
  isTrashed = false,
  onView,
  viewHref,
  onEdit,
  editHref,
  onDelete,
  onRestore,
  viewTooltip = 'View',
  editTooltip = 'Edit',
  deleteTooltip = 'Delete',
  restoreTooltip = 'Restore',
  customActions,
}) => {
  return (
    <div className="flex items-center justify-end gap-1">
      {customActions}
      {!isTrashed ? (
        <>
          {(onView || viewHref) && (
            <Tooltip text={viewTooltip}>
              <Button
                variant="ghost"
                size="xs"
                onClick={onView}
                href={viewHref}
                className="text-gray-500 hover:text-brand-500"
              >
                <Eye size={18} />
              </Button>
            </Tooltip>
          )}
          {(onEdit || editHref) && (
            <Tooltip text={editTooltip}>
              <Button
                variant="ghost"
                size="xs"
                onClick={onEdit}
                href={editHref}
                className="text-gray-500 hover:text-blue-600"
              >
                <Edit size={18} />
              </Button>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip text={deleteTooltip}>
              <Button
                variant="ghost"
                size="xs"
                onClick={onDelete}
                className="text-gray-500 hover:text-red-600"
              >
                <Trash size={18} />
              </Button>
            </Tooltip>
          )}
        </>
      ) : (
        <>
          {onRestore && (
            <Tooltip text={restoreTooltip}>
              <Button
                variant="ghost"
                size="xs"
                onClick={onRestore}
                className="text-gray-500 hover:text-green-600"
              >
                <RotateCcw size={18} />
              </Button>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip text="Permanently Delete">
              <Button
                variant="ghost"
                size="xs"
                onClick={onDelete}
                className="text-gray-500 hover:text-red-700"
              >
                <Trash size={18} />
              </Button>
            </Tooltip>
          )}
        </>
      )}
    </div>
  );
};

export default TableActions;
