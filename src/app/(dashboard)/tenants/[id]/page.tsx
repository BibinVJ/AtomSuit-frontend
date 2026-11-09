'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import PageMeta from '@/components/common/PageMeta';
import SkeletonForm from '@/components/common/SkeletonForm';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Tenant } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/hooks/useSettings';
import { getTenant } from '@/services/TenantService';
import TenantModules from './_components/TenantModules';

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error'> = {
  active: 'success',
  trial: 'warning',
  suspended: 'error',
};

export default function TenantDetailPage() {
  const { hasPermission } = usePermissions();
  const { formatDate } = useSettings();
  const router = useRouter();
  const params = useParams();
  const tenantId = String(params?.id ?? '');

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setTenant(await getTenant(tenantId));
    } catch {
      toast.error('Failed to load tenant');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (tenantId) load();
  }, [tenantId, load]);

  if (!hasPermission('view-tenant')) {
    return <div className="p-6 text-center">Access Denied</div>;
  }

  const domain =
    typeof tenant?.domain_name === 'string' ? tenant.domain_name : tenant?.domain_name?.domain;

  const details: { label: string; value: string }[] = tenant
    ? [
        { label: 'Email', value: tenant.email || '—' },
        { label: 'Phone', value: tenant.phone || '—' },
        { label: 'Domain', value: domain || '—' },
        { label: 'Plan', value: tenant.current_plan?.name || 'No plan' },
        { label: 'Created', value: tenant.created_at ? formatDate(tenant.created_at) : '—' },
        { label: 'Tenant ID', value: tenant.id },
      ]
    : [];

  return (
    <>
      <PageMeta title="Tenant Details" description="Tenant details and module access" />
      <PageBreadcrumb pageTitle="Tenant Details" />

      <div className="mb-4">
        <Button variant="outline" onClick={() => router.push('/tenants')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Tenants
        </Button>
      </div>

      {isLoading ? (
        <SkeletonForm rows={2} columns={3} />
      ) : !tenant ? (
        <div className="p-6 text-center text-gray-500">Tenant not found.</div>
      ) : (
        <div className="space-y-6">
          <div className="p-6 border border-gray-200 rounded-2xl bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold dark:text-white">{tenant.name}</h2>
              {tenant.status && (
                <Badge size="sm" color={STATUS_COLOR[tenant.status] ?? 'primary'}>
                  {tenant.status}
                </Badge>
              )}
            </div>

            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {details.map((detail) => (
                <div key={detail.label}>
                  <dt className="text-theme-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {detail.label}
                  </dt>
                  <dd className="mt-1 break-words text-gray-800 dark:text-white/90">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <TenantModules tenantId={tenant.id} />
        </div>
      )}
    </>
  );
}
