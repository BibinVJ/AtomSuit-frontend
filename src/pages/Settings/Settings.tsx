'use client';

import { useCallback, useEffect, useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import SettingsGroup from '../../components/settings/SettingsGroup';
import { getSettings } from '../../services/SettingsService';
import { Setting } from '../../types';
import { formatLabel } from '../../utils/string';

export default function Settings() {
  const [settingsGroups, setSettingsGroups] = useState<Record<string, Setting[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<string>('');

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getSettings();
      setSettingsGroups(response.data);
      if (!activeGroup && Object.keys(response.data).length > 0) {
        setActiveGroup(Object.keys(response.data)[0]);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeGroup]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (isLoading) {
    return (
      <>
        <PageMeta title="Settings" description="Application settings" />
        <PageBreadcrumb pageTitle="Settings" />
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading settings...</div>
        </div>
      </>
    );
  }

  const groupNames = Object.keys(settingsGroups);

  return (
    <>
      <PageMeta title="Settings" description="Application settings" />
      <PageBreadcrumb pageTitle="Settings" />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:w-64 flex-shrink-0 lg:sticky lg:top-24 lg:self-start">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide">
            {groupNames.map((groupName) => (
              <button
                key={groupName}
                onClick={() => setActiveGroup(groupName)}
                className={`whitespace-nowrap px-4 py-3 text-sm font-medium rounded-xl transition-all text-left ${
                  activeGroup === groupName
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-200 dark:shadow-none'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                {formatLabel(groupName) || 'General'}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
          {activeGroup && settingsGroups[activeGroup] ? (
            <ComponentCard title={formatLabel(activeGroup)}>
              <SettingsGroup
                groupName={activeGroup}
                settings={settingsGroups[activeGroup]}
                onUpdate={fetchSettings}
              />
            </ComponentCard>
          ) : (
            <ComponentCard title="Settings">
              <div className="text-center py-8 text-gray-500">
                {groupNames.length === 0
                  ? 'No settings found'
                  : 'Select a category to view settings'}
              </div>
            </ComponentCard>
          )}
        </div>
      </div>
    </>
  );
}
