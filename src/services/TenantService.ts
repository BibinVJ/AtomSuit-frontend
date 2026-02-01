import api from './api';
import { Tenant, TenantInput } from '@/types';
import { createBaseService } from './BaseService';

const baseService = createBaseService<Tenant, TenantInput>('/tenants');

export const getTenants = baseService.list;
export const getTenant = baseService.get;
export const createTenant = baseService.create;
export const updateTenant = baseService.update;
export const deleteTenant = baseService.delete;

export const sendTenantMail = async (id: number, mailData: Record<string, unknown>) => {
  const response = await api.post(`/tenants/${id}/send-mail`, mailData);
  return response.data;
};

export const getTenantStats = async () => {
  const response = await api.get('/tenant-stats');
  return response.data;
};

const TenantService = {
  ...baseService,
  sendTenantMail,
  getTenantStats,
};

export default TenantService;
