import { Role, RoleApiResponse } from '../types/Role';
import api from './api';

export const getRoles = async (page = 1, limit = 10, sortCol = 'created_at', sortDir = 'desc', unpaginated = false): Promise<RoleApiResponse> => {
  const url = unpaginated ? '/role?unpaginated=1' : `/role?perPage=${limit}&page=${page}&sort_by=${sortCol}&sort_direction=${sortDir}`;
  const response = await api.get(url);
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

export const deleteRole = async (id: number) => {
  const response = await api.delete(`/role/${id}`);
  return response.data;
};
