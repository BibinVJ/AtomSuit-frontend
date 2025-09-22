import { User, UserApiResponse, UserUpdatePayload } from '../types/User';
import api from './api';

export const getUsers = async (page = 1, limit = 10, sortCol = 'created_at', sortDir = 'desc'): Promise<UserApiResponse> => {
  const response = await api.get(`/user?perPage=${limit}&page=${page}&sort_by=${sortCol}&sort_direction=${sortDir}`);
  return response.data;
};

export const getUser = async (id: string): Promise<User> => {
    const response = await api.get(`/user/${id}`);
    return response.data;
};

export const createUser = async (userData: Omit<User, 'id' | 'status' | 'is_admin' | 'role' | 'permission_names' | 'created_at' | 'email_verified_at' | 'phone_verified_at' | 'status_updated_at'> & { password?: string; role_id?: number }) => {
  const response = await api.post('/user', userData);
  return response.data;
};

export const updateUser = async (id: number, userData: UserUpdatePayload) => {
  const response = await api.put(`/user/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await api.delete(`/user/${id}`);
  return response.data;
};
