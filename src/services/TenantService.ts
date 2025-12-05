import api from './api';
import { TenantApiResponse } from '../types';

export const getTenants = async (
  page = 1,
  limit = 10,
  sortCol = 'created_at',
  sortDir = 'desc',
  filters: any = {}
): Promise<TenantApiResponse> => {
  const params = new URLSearchParams({
    perPage: limit.toString(),
    page: page.toString(),
    sort_by: sortCol,
    sort_direction: sortDir,
    ...filters,
  });
  const response = await api.get(`/tenant?${params.toString()}`);
  return response.data;
};

export const getTenant = async (id: number) => {
  const response = await api.get(`/tenant/${id}`);
  return response.data;
};

export const createTenant = async (tenant: any) => {
  const response = await api.post('/tenant', tenant);
  return response.data;
};

export const updateTenant = async (id: number, tenant: any) => {
  const response = await api.put(`/tenant/${id}`, tenant);
  return response.data;
};

export const deleteTenant = async (id: number) => {
  const response = await api.delete(`/tenant/${id}`);
  return response.data;
};

export const sendTenantMail = async (id: number, mailData: any) => {
  const response = await api.post(`/tenant/${id}/send-mail`, mailData);
  return response.data;
};

export const getTenantStats = async () => {
  const response = await api.get('/tenant-stats');
  return response.data;
};
