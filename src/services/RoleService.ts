import { Role, RoleApiResponse } from '../types/Role';
import api from './api';

export const getRoles = async (params: {
  page?: number;
  limit?: number;
  sortCol?: string;
  sortDir?: string;
  from?: number;
  to?: number;
  search?: string;
  unpaginated?: boolean;
  trashed?: 'only' | 'with';
} = {}): Promise<RoleApiResponse> => {
  const {
    page = 1,
    limit = 10,
    sortCol = 'created_at',
    sortDir = 'desc',
    from,
    to,
    search,
    unpaginated = false,
    trashed,
  } = params;

  const requestParams: any = { perPage: limit, page, sort_by: sortCol, sort_direction: sortDir };
  if (unpaginated) requestParams.unpaginated = 1;
  if (from !== undefined) requestParams.from = from;
  if (to !== undefined) requestParams.to = to;
  if (search) requestParams.search = search;
  if (trashed) requestParams.trashed = trashed;

  const response = await api.get(`/role`, { params: requestParams });
  return response.data;
};

export const getRole = async (id: string): Promise<Role> => {
    const response = await api.get(`/role/${id}`);
    return response.data.data;
};

export const createRole = async (roleData: { name: string; permissions: number[]}) => {
  const response = await api.post('/role', roleData);
  return response.data;
};

export const updateRole = async (id: number, roleData: { name: string; permissions: number[] }) => {
  const response = await api.put(`/role/${id}`, roleData);
  return response.data;
};

export const deleteRole = async (id: number, force = false) => {
  const response = await api.delete(`/role/${id}${force ? '?force=1' : ''}`);
  return response.data;
};

export const restoreRole = async (id: number) => {
  const response = await api.post(`/role/${id}/restore`);
  return response.data;
};
