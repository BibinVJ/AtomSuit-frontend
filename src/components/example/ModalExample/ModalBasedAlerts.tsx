'use client';
import React from 'react';
import ComponentCard from '../../common/ComponentCard';
import { Modal } from '../../ui/modal';
import { useModal } from '@/hooks/useModal';

export default function ModalBasedAlerts() {
  const successModal = useModal();
  const infoModal = useModal();
  const warningModal = useModal();
  const errorModal = useModal();

  return (
    <ComponentCard title="Modal Based Alerts">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={successModal.openModal}
          className="px-4 py-3 text-sm font-medium text-white rounded-lg bg-success-500 shadow-theme-xs hover:bg-success-600"
        >
          Success Alert
        </button>
        <button
          onClick={infoModal.openModal}
          className="px-4 py-3 text-sm font-medium text-white rounded-lg bg-blue-500 shadow-theme-xs hover:bg-blue-600"
        >
          Info Alert
        </button>
        <button
          onClick={warningModal.openModal}
          className="px-4 py-3 text-sm font-medium text-white rounded-lg bg-warning-500 shadow-theme-xs hover:bg-warning-600"
        >
          Warning Alert
        </button>
        <button
          onClick={errorModal.openModal}
          className="px-4 py-3 text-sm font-medium text-white rounded-lg bg-error-500 shadow-theme-xs hover:bg-error-600"
        >
          Danger Alert
        </button>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={successModal.isOpen}
        onClose={successModal.closeModal}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <div className="text-center">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Success!</h4>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400 mb-6">
            Operation completed successfully.
          </p>
          <button
            type="button"
            onClick={successModal.closeModal}
            className="px-4 py-3 text-sm font-medium text-white rounded-lg bg-success-500 shadow-theme-xs hover:bg-success-600"
          >
            Okay, Got It
          </button>
        </div>
      </Modal>

      {/* Info Modal */}
      <Modal
        isOpen={infoModal.isOpen}
        onClose={infoModal.closeModal}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <div className="text-center">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Information!
          </h4>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400 mb-6">
            This is an informational alert.
          </p>
          <button
            type="button"
            onClick={infoModal.closeModal}
            className="px-4 py-3 text-sm font-medium text-white rounded-lg bg-blue-500 shadow-theme-xs hover:bg-blue-600"
          >
            Got It
          </button>
        </div>
      </Modal>

      {/* Warning Modal */}
      <Modal
        isOpen={warningModal.isOpen}
        onClose={warningModal.closeModal}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <div className="text-center">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Warning!</h4>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400 mb-6">
            Please be careful with this action.
          </p>
          <button
            type="button"
            onClick={warningModal.closeModal}
            className="px-4 py-3 text-sm font-medium text-white rounded-lg bg-warning-500 shadow-theme-xs hover:bg-warning-600"
          >
            Understood
          </button>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal
        isOpen={errorModal.isOpen}
        onClose={errorModal.closeModal}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <div className="text-center">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Error!</h4>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400 mb-6">
            Something went wrong. Please try again.
          </p>
          <button
            type="button"
            onClick={errorModal.closeModal}
            className="px-4 py-3 text-sm font-medium text-white rounded-lg bg-error-500 shadow-theme-xs hover:bg-error-600"
          >
            Close
          </button>
        </div>
      </Modal>
    </ComponentCard>
  );
}
