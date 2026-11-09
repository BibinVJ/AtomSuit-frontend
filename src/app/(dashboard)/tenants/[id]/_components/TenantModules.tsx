'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Blocks, Plug } from 'lucide-react';
import Switch from '@/components/form/switch/Switch';
import Badge from '@/components/ui/badge/Badge';
import SkeletonTable from '@/components/common/SkeletonTable';
import { Module, ModuleSource } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { isApiError } from '@/utils/errors';
import ModuleService from '@/services/ModuleService';

interface Props {
  tenantId: string;
}

const SOURCE_LABEL: Record<ModuleSource, string> = {
  plan: 'From plan',
  admin: 'Granted',
  purchased: 'Purchased',
};

const SOURCE_COLOR: Record<ModuleSource, 'primary' | 'success' | 'info'> = {
  plan: 'primary',
  admin: 'info',
  purchased: 'success',
};

export default function TenantModules({ tenantId }: Props) {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('manage-module');

  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Slugs currently being written, so a row can't be toggled twice in flight.
  const [pending, setPending] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setModules(await ModuleService.getTenantModules(tenantId));
    } catch {
      toast.error('Failed to load modules');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (module: Module, enabled: boolean) => {
    if (pending.includes(module.slug)) return;

    setPending((prev) => [...prev, module.slug]);
    // Optimistic: the switch has already moved, so reflect it and roll back on failure.
    setModules((prev) =>
      prev.map((m) =>
        m.slug === module.slug ? { ...m, is_enabled: enabled, source: enabled ? 'admin' : null } : m
      )
    );

    try {
      if (enabled) {
        await ModuleService.enableTenantModule(tenantId, module.slug);
        toast.success(`${module.name} enabled`);
      } else {
        await ModuleService.disableTenantModule(tenantId, module.slug);
        toast.success(
          module.source === 'plan'
            ? `${module.name} disabled — note it is included in the tenant's plan and will return on the next plan sync`
            : `${module.name} disabled`
        );
      }
      // Re-read so `source` reflects what the server actually recorded.
      setModules(await ModuleService.getTenantModules(tenantId));
    } catch (error: unknown) {
      setModules((prev) => prev.map((m) => (m.slug === module.slug ? { ...m, ...module } : m)));
      toast.error(
        isApiError(error)
          ? (error.response?.data?.message ?? 'Failed to update module')
          : 'Failed to update module'
      );
    } finally {
      setPending((prev) => prev.filter((slug) => slug !== module.slug));
    }
  };

  const groups = useMemo(
    () => [
      {
        key: 'module' as const,
        title: 'Modules',
        hint: 'Industry and capability packs. Features appear in the tenant only while enabled.',
        icon: Blocks,
        items: modules.filter((m) => m.type === 'module'),
      },
      {
        key: 'integration' as const,
        title: 'Integrations',
        hint: 'Third-party connections.',
        icon: Plug,
        items: modules.filter((m) => m.type === 'integration'),
      },
    ],
    [modules]
  );

  const enabledCount = modules.filter((m) => m.is_enabled).length;

  if (isLoading) {
    return (
      <div className="p-6 border border-gray-200 rounded-2xl bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <SkeletonTable rows={5} columns={2} />
      </div>
    );
  }

  return (
    <div className="p-6 border border-gray-200 rounded-2xl bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xl font-bold dark:text-white">Modules</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {enabledCount} of {modules.length} enabled
        </span>
      </div>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {canManage
          ? 'Switch a module on to give this tenant access to it.'
          : 'You do not have permission to change modules for this tenant.'}
      </p>

      {modules.length === 0 ? (
        <p className="py-6 text-center text-gray-500 dark:text-gray-400">No modules available.</p>
      ) : (
        <div className="space-y-8">
          {groups
            .filter((group) => group.items.length > 0)
            .map((group) => {
              const Icon = group.icon;

              return (
                <div key={group.key}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <h4 className="font-semibold text-gray-800 dark:text-white/90">
                      {group.title}
                    </h4>
                  </div>
                  <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">{group.hint}</p>

                  <div className="divide-y divide-gray-100 dark:divide-white/[0.05] rounded-xl border border-gray-100 dark:border-gray-800">
                    {group.items.map((module) => (
                      <div
                        key={module.slug}
                        className="flex items-center justify-between gap-4 px-4 py-4"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-gray-800 dark:text-white/90">
                              {module.name}
                            </p>
                            {module.is_enabled && module.source && (
                              <Badge size="sm" color={SOURCE_COLOR[module.source]}>
                                {SOURCE_LABEL[module.source]}
                              </Badge>
                            )}
                          </div>
                          {module.description && (
                            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                              {module.description}
                            </p>
                          )}
                          {module.is_enabled && module.source === 'plan' && (
                            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                              Included in the tenant&apos;s plan — turning it off here is temporary
                              and it will return on the next plan sync.
                            </p>
                          )}
                        </div>

                        <Switch
                          label=""
                          ariaLabel={`${module.is_enabled ? 'Disable' : 'Enable'} ${module.name}`}
                          checked={!!module.is_enabled}
                          disabled={!canManage || pending.includes(module.slug)}
                          onChange={(checked) => handleToggle(module, checked)}
                          tooltip={canManage ? undefined : 'Requires the manage-module permission'}
                        />
                      </div>
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
