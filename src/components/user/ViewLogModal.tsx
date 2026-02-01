'use client';

import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import { UserLoginDetail } from '@/types/User';
import Badge from '../ui/badge/Badge';

interface ViewLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: UserLoginDetail;
}

export default function ViewLogModal({ isOpen, onClose, log }: ViewLogModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6 md:p-8">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Login Details</h3>
        <p className="text-sm text-gray-500 mt-1">Detailed information about this login session.</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              User
            </label>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {log.user?.name || 'Unknown'}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Login At
            </label>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {new Date(log.login_at).toLocaleString()}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Login Method
            </label>
            <div className="text-sm text-gray-900 dark:text-white">
              <Badge size="sm" color="light">
                {log.login_method}
              </Badge>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Status
            </label>
            <div className="text-sm text-gray-900 dark:text-white">
              {log.logout_at ? (
                <Badge size="sm" color="gray">
                  Logged Out
                </Badge>
              ) : (
                <Badge size="sm" color="success">
                  Active Session
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Device & Location
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                IP Address
              </label>
              <div className="text-sm text-gray-900 dark:text-white font-mono bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded inline-block">
                {log.ip_address}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Location
              </label>
              <div className="text-sm text-gray-900 dark:text-white">
                {log.city && log.country
                  ? `${log.city}, ${log.country} ${log.iso_code ? `(${log.iso_code})` : ''}`
                  : 'Unknown'}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Device Type
              </label>
              <div className="text-sm text-gray-900 dark:text-white capitalize">
                {log.device_type || 'Unknown'}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                OS / Browser
              </label>
              <div className="text-sm text-gray-900 dark:text-white">
                {log.os || 'Unknown'} / {log.browser || 'Unknown'}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            User Agent
          </label>
          <div className="text-xs text-gray-600 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-800 p-3 rounded-lg break-all">
            {log.user_agent}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>
    </Modal>
  );
}
