"use client";

import { useEffect, useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import SettingsGroup from '../../components/settings/SettingsGroup';
import { getSettings } from '../../services/SettingsService';
import { Setting } from '../../types';

export default function Settings() {
  const [settingsGroups, setSettingsGroups] = useState<Record<string, Setting[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await getSettings();
      setSettingsGroups(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

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

  return (
    <>
      <PageMeta title="Settings" description="Application settings" />
      <PageBreadcrumb pageTitle="Settings" />
      
      <div className="space-y-6">
        {Object.entries(settingsGroups).map(([groupName, settings]) => (
          <ComponentCard key={groupName} title={groupName || 'General'}>
            <SettingsGroup
              groupName={groupName}
              settings={settings}
              onUpdate={fetchSettings}
            />
          </ComponentCard>
        ))}
        
        {Object.keys(settingsGroups).length === 0 && (
          <ComponentCard title="Settings">
            <div className="text-center py-8 text-gray-500">
              No settings found
            </div>
          </ComponentCard>
        )}
      </div>
    </>
  );
}