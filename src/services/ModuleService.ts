import api from './api';
import { Module } from '@/types';

/**
 * Modules are central-context (super-admin) data: the catalogue of verticals and integrations,
 * which plans bundle them, and which tenants have them switched on.
 *
 * Not built on createBaseService — modules aren't tenant CRUD; they're a fixed catalogue plus
 * per-tenant enable/disable, so the endpoints don't match the base contract.
 */

/** The full module catalogue (super admin). */
export const getModules = async (): Promise<Module[]> => {
  const response = await api.get('/modules');
  return response.data.data ?? [];
};

/** Every module, each flagged with whether this tenant has it and where it came from. */
export const getTenantModules = async (tenantId: string): Promise<Module[]> => {
  const response = await api.get(`/tenants/${tenantId}/modules`);
  return response.data.data ?? [];
};

export const enableTenantModule = async (tenantId: string, slug: string) => {
  const response = await api.post(`/tenants/${tenantId}/modules`, { slug });
  return response.data;
};

export const disableTenantModule = async (tenantId: string, slug: string) => {
  const response = await api.delete(`/tenants/${tenantId}/modules/${slug}`);
  return response.data;
};

/** Modules enabled for the *current* tenant — drives feature visibility in the tenant UI. */
export const getMyModules = async (): Promise<Module[]> => {
  const response = await api.get('/my-modules');
  return response.data.data ?? [];
};

const ModuleService = {
  getModules,
  getTenantModules,
  enableTenantModule,
  disableTenantModule,
  getMyModules,
};

export default ModuleService;
