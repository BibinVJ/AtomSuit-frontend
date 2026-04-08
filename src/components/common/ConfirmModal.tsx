'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const iconColor = variant === 'danger' ? 'text-red-500' : 'text-amber-500';
  const iconBg =
    variant === 'danger' ? 'bg-red-50 dark:bg-red-500/10' : 'bg-amber-50 dark:bg-amber-500/10';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md p-6 sm:p-8"
      showCloseButton={false}
    >
      <div className="text-center">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${iconBg} mb-5`}
        >
          <svg
            className={`h-7 w-7 ${iconColor}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            ></path>
          </svg>
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>

        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'primary' : 'primary'}
            onClick={onConfirm}
            disabled={isLoading}
            className={
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-white'
            }
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
