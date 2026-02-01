'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import ComponentCard from '../../../components/common/ComponentCard';
import PageMeta from '../../../components/common/PageMeta';
import SettingsGroup from '../../../components/settings/SettingsGroup';
import { getSettings } from '../../../services/SettingsService';
import { Setting } from '../../../types';
import { formatLabel } from '../../../utils/string';

// Define the mapping of URL paths to settings groups
const ROUTE_GROUP_MAPPING: Record<string, string[]> = {
  general: ['company', 'general', 'appearance', 'notifications', 'business', 'social'],
  configurations: ['financial', 'invoicing', 'inventory', 'accounting'],
  'default-accounts': [
    'default_accounts_customer',
    'default_accounts_vendor',
    'default_accounts_inventory',
    'default_accounts_other',
  ],
};

// Categorized default accounts
const DEFAULT_ACCOUNTS_MAPPING: Record<string, string[]> = {
  default_accounts_customer: [
    'default_sales_account',
    'default_sales_discount_account',
    'default_receivable_account',
    'default_sales_return_account',
  ],
  default_accounts_vendor: [
    'default_payable_account',
    'default_purchase_account',
    'default_purchase_discount_account',
    'default_purchase_return_account',
  ],
  default_accounts_inventory: [
    'default_cogs_account',
    'default_inventory_account',
    'default_inventory_adjustment_account',
  ],
  default_accounts_other: [
    'retained_earnings_account',
    'profit_loss_year_account',
    'exchange_variances_account',
    'bank_charges_account',
  ],
};

// Flatten to check for keys quickly
const DEFAULT_ACCOUNT_KEYS = Object.values(DEFAULT_ACCOUNTS_MAPPING).flat();

// Custom labels for specific groups
const GROUP_LABELS: Record<string, string> = {
  default_accounts_customer: 'Customer',
  default_accounts_vendor: 'Vendor',
  default_accounts_inventory: 'Inventory',
  default_accounts_other: 'Other',
};

export default function Settings({ params }: { params: { category: string } }) {
  const router = useRouter();
  const [settingsGroups, setSettingsGroups] = useState<Record<string, Setting[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Derive the active category from the params
  const currentCategory = params.category || 'general';

  // Determine available groups for this category
  const targetGroups = useMemo(() => ROUTE_GROUP_MAPPING[currentCategory] || [], [currentCategory]);

  // Local state for the active sub-group (sidebar selection)
  const [activeSubGroup, setActiveSubGroup] = useState<string>('');

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getSettings();
      const allSettingsGroups = response.data as unknown as Record<string, Setting[]>;

      // Process settings to separate default accounts if needed
      const processedGroups: Record<string, Setting[]> = { ...allSettingsGroups };

      // Initialize default account groups
      const defaultAccountGroups: Record<string, Setting[]> = {
        default_accounts_customer: [],
        default_accounts_vendor: [],
        default_accounts_inventory: [],
        default_accounts_other: [],
      };

      // Extract default accounts from all groups
      Object.keys(allSettingsGroups).forEach((group) => {
        const groupSettings = allSettingsGroups[group];
        const remainingSettings: Setting[] = [];

        groupSettings.forEach((setting: Setting) => {
          if (DEFAULT_ACCOUNT_KEYS.includes(setting.key)) {
            // Find which group this key belongs to
            const targetGroupKey = Object.keys(DEFAULT_ACCOUNTS_MAPPING).find((key) =>
              DEFAULT_ACCOUNTS_MAPPING[key].includes(setting.key)
            );
            if (targetGroupKey) {
              defaultAccountGroups[targetGroupKey].push(setting);
            }
          } else {
            remainingSettings.push(setting);
          }
        });

        // Update the group with remaining settings
        if (remainingSettings.length > 0) {
          processedGroups[group] = remainingSettings;
        } else {
          delete processedGroups[group];
        }
      });

      // Add the constructed Default Account groups to processedGroups
      Object.keys(defaultAccountGroups).forEach((key) => {
        if (defaultAccountGroups[key].length > 0) {
          processedGroups[key] = defaultAccountGroups[key];
        }
      });

      setSettingsGroups(processedGroups);

      // Filter groups relevant to the current category to determine defaults
      const availableGroups = Object.keys(processedGroups).filter((group) =>
        targetGroups.includes(group)
      );

      // Set initial active sub-group if not set
      if (availableGroups.length > 0) {
        setActiveSubGroup(availableGroups[0]);
      } else {
        setActiveSubGroup('');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [targetGroups]); // Depend on currentCategory and targetGroups to re-eval default activeSubGroup

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Effect to reset activeSubGroup when category changes or data loads
  useEffect(() => {
    if (Object.keys(settingsGroups).length > 0) {
      const availableGroups = Object.keys(settingsGroups).filter((group) =>
        targetGroups.includes(group)
      );
      if (availableGroups.length > 0 && !availableGroups.includes(activeSubGroup)) {
        setActiveSubGroup(availableGroups[0]);
      }
    }
  }, [currentCategory, settingsGroups, activeSubGroup, targetGroups]);

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

  // Filter settingsGroups to only include those in targetGroups
  const filteredGroups = Object.keys(settingsGroups)
    .filter((group) => targetGroups.includes(group))
    .reduce(
      (obj, key) => {
        obj[key] = settingsGroups[key];
        return obj;
      },
      {} as Record<string, Setting[]>
    );

  const groupKeys = Object.keys(filteredGroups);

  return (
    <>
      <PageMeta
        title={`Settings - ${formatLabel(currentCategory)}`}
        description="Application settings"
      />
      <PageBreadcrumb pageTitle={formatLabel(currentCategory)} />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Internal Sidebar for Sub-groups */}
        {groupKeys.length > 1 && (
          <aside className="lg:w-64 flex-shrink-0 lg:sticky lg:top-24 lg:self-start">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide">
              {groupKeys.map((groupName) => (
                <button
                  key={groupName}
                  onClick={() => setActiveSubGroup(groupName)}
                  className={`whitespace-nowrap px-4 py-3 text-sm font-medium rounded-xl transition-all text-left ${
                    activeSubGroup === groupName
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-200 dark:shadow-none'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  {GROUP_LABELS[groupName] || formatLabel(groupName)}
                </button>
              ))}
            </nav>
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex-1">
          {activeSubGroup && settingsGroups[activeSubGroup] ? (
            <ComponentCard title={GROUP_LABELS[activeSubGroup] || formatLabel(activeSubGroup)}>
              <SettingsGroup
                groupName={activeSubGroup}
                settings={settingsGroups[activeSubGroup]}
                onUpdate={fetchSettings}
              />
            </ComponentCard>
          ) : (
            <ComponentCard title={formatLabel(currentCategory)}>
              <div className="text-center py-8 text-gray-500">
                {groupKeys.length === 0
                  ? 'No settings found for this category.'
                  : 'Select a section to view settings'}
              </div>
            </ComponentCard>
          )}
        </div>
      </div>
    </>
  );
}
