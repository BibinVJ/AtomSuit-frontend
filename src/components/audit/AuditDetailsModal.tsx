"use client";

import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import { AuditEntry } from '../../types';
import { formatLabel } from '../../utils/string';
import { useContext } from 'react';
import { SettingsContext } from '../../context/SettingsContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    entry: AuditEntry | null;
}

export default function AuditDetailsModal({ isOpen, onClose, entry }: Props) {
    const settingsContext = useContext(SettingsContext);
    const formatDateTime = settingsContext?.formatDateTime || ((date: string | Date) => new Date(date).toLocaleString());

    if (!entry) return null;

    const changedAttributes = entry.properties.attributes || {};
    const oldAttributes = entry.properties.old || {};
    const allKeys = Array.from(new Set([...Object.keys(changedAttributes), ...Object.keys(oldAttributes)]));

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[800px] p-6 md:p-10">
            <div className="relative w-full">
                <div className="pr-12">
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                        Audit Activity Details
                    </h4>
                    <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                        Detailed view of the changes made during this activity.
                    </p>
                </div>

                <div className="px-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-gray-50 dark:bg-white/[0.03] rounded-lg border border-gray-100 dark:border-white/[0.05]">
                            <span className="block text-gray-500 mb-1">Caused By</span>
                            <span className="font-medium text-gray-800 dark:text-white">{entry.causer?.name || 'System'}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-white/[0.03] rounded-lg border border-gray-100 dark:border-white/[0.05]">
                            <span className="block text-gray-500 mb-1">Occurred At</span>
                            <span className="font-medium text-gray-800 dark:text-white">
                                {formatDateTime(entry.created_at)}
                            </span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-white/[0.03] rounded-lg border border-gray-100 dark:border-white/[0.05]">
                            <span className="block text-gray-500 mb-1">Event</span>
                            <span className="font-medium text-gray-800 dark:text-white capitalize">{entry.event}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-white/[0.03] rounded-lg border border-gray-100 dark:border-white/[0.05]">
                            <span className="block text-gray-500 mb-1">Subject</span>
                            <span className="font-medium text-gray-800 dark:text-white">
                                {entry.subject_type.split('\\').pop()} (#{entry.subject_id})
                            </span>
                        </div>
                    </div>

                    <div>
                        <h5 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Changes</h5>
                        {allKeys.length > 0 ? (
                            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05]">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-white/[0.03] border-b border-gray-200 dark:border-white/[0.05]">
                                        <tr>
                                            <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Field</th>
                                            <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Old Value</th>
                                            <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">New Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {allKeys.map((key) => {
                                            const oldValue = oldAttributes[key];
                                            const newValue = changedAttributes[key];

                                            // Skip internal fields or large objects if any
                                            if (['password', 'remember_token'].includes(key)) return null;

                                            return (entry.event === 'updated' && oldValue === newValue) ? null : (
                                                <tr key={key}>
                                                    <td className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                                                        {formatLabel(key)}
                                                    </td>
                                                    <td className="px-4 py-3 text-red-600 dark:text-red-400 bg-red-50/30 dark:bg-red-900/10">
                                                        {oldValue !== null && oldValue !== undefined ? String(oldValue) : <small className="italic text-gray-400">null</small>}
                                                    </td>
                                                    <td className="px-4 py-3 text-green-600 dark:text-green-400 bg-green-50/30 dark:bg-green-900/10">
                                                        {newValue !== null && newValue !== undefined ? String(newValue) : <small className="italic text-gray-400">null</small>}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 italic bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                                No detailed field changes recorded.
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 px-2 mt-8 lg:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
