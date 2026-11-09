'use client';

import { useEffect, useMemo, useState } from 'react';
import { Blocks, Plug } from 'lucide-react';
import Checkbox from '@/components/form/input/Checkbox';
import Label from '@/components/form/Label';
import { Module } from '@/types';
import ModuleService from '@/services/ModuleService';

interface Props {
  /** Ids of the modules bundled with this plan. */
  value: number[];
  onChange: (moduleIds: number[]) => void;
}

/**
 * Picks the modules a plan includes. Shared by the add and edit plan modals.
 *
 * Subscribing to the plan grants these modules to the tenant (source: 'plan'); editing the set
 * re-syncs everyone already on the plan, leaving admin-granted and purchased modules alone.
 */
export default function PlanModulesField({ value, onChange }: Props) {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;

    ModuleService.getModules()
      .then((data) => active && setModules(data))
      .catch(() => active && setLoadFailed(true))
      .finally(() => active && setIsLoading(false));

    return () => {
      active = false;
    };
  }, []);

  const toggle = (moduleId: number, checked: boolean) => {
    onChange(checked ? [...value, moduleId] : value.filter((id) => id !== moduleId));
  };

  const groups = useMemo(
    () => [
      { key: 'module' as const, title: 'Modules', icon: Blocks },
      { key: 'integration' as const, title: 'Integrations', icon: Plug },
    ],
    []
  );

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-1">
        <Label>Included Modules</Label>
        <span className="text-xs text-gray-500 dark:text-gray-400">{value.length} selected</span>
      </div>
      <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
        Tenants on this plan get these automatically. Changing them re-syncs existing subscribers;
        modules granted directly to a tenant are left alone.
      </p>

      {isLoading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading modules…</p>
      ) : loadFailed ? (
        <p className="text-sm text-red-500">
          Could not load the module list. The plan can still be saved without changing modules.
        </p>
      ) : modules.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No modules available.</p>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => {
            const items = modules.filter((m) => m.type === group.key);
            if (items.length === 0) return null;
            const Icon = group.icon;

            return (
              <div key={group.key}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-gray-400" />
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {group.title}
                  </h5>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {items.map((module) => (
                    <label
                      key={module.id}
                      className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-500/40"
                    >
                      <Checkbox
                        checked={value.includes(module.id)}
                        onChange={(checked) => toggle(module.id, checked)}
                        ariaLabel={`Include ${module.name} in this plan`}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-gray-800 dark:text-white/90">
                          {module.name}
                        </span>
                        {module.description && (
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            {module.description}
                          </span>
                        )}
                        {!module.is_active && (
                          <span className="block text-xs text-amber-600 dark:text-amber-400">
                            Globally inactive — tenants will not get access until it is reactivated.
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
