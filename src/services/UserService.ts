import api from './api';
import { UserApiResponse } from '../types';

export const getUsers = async (params: {
  page?: number;
  limit?: number;
  sortCol?: string;
  sortDir?: string;
  from?: number;
  to?: number;
  search?: string;
  role?: string;
  status?: string;
  trashed?: 'only' | 'with';
} = {}): Promise<UserApiResponse> => {
  const {
    page = 1,
    limit = 10,
    sortCol = 'created_at',
    sortDir = 'desc',
    from,
    to,
    search,
    role,
    status,
    trashed,
  } = params;

  const requestParams: any = { perPage: limit, page, sort_by: sortCol, sort_direction: sortDir };
  if (from !== undefined) requestParams.from = from;
  if (to !== undefined) requestParams.to = to;
  if (search) requestParams.search = search;
  if (role) requestParams.role = role;
  if (status) requestParams.status = status;
  if (trashed) requestParams.trashed = trashed;

  const response = await api.get(`/user`, { params: requestParams });
  return response.data;
};

export const addUser = async (user: any) => {
  const response = await api.post('/user', user);
  return response.data;
};

export const updateUser = async (id: number, user: any) => {
  const response = await api.put(`/user/${id}`, user);
  return response.data;
};

export const deleteUser = async (id: number, force = false) => {
  const response = await api.delete(`/user/${id}${force ? '?force=1' : ''}`);
  return response.data;
};

export const restoreUser = async (id: number) => {
  const response = await api.post(`/user/${id}/restore`);
  return response.data;
};
