
import { CategoryApiResponse } from '../types';
import api from './api';

export const getCategories = async (page = 1, limit = 10, sortCol = 'created_at', sortDir = 'desc', unpaginated = false): Promise<CategoryApiResponse> => {
  const url = unpaginated ? '/category?unpaginated=1' : `/category?perPage=${limit}&page=${page}&sort_by=${sortCol}&sort_direction=${sortDir}`;
  const response = await api.get(url);
  return response.data;
};

export const addCategory = async (category: { name: string; description: string; is_active: boolean }) => {
  const response = await api.post('/category', category);
  return response.data;
};

export const updateCategory = async (id: number, category: { name: string; description: string; is_active: boolean }) => {
  const response = await api.put(`/category/${id}`, category);
  return response.data;
};

export const deleteCategory = async (id: number) => {
  const response = await api.delete(`/category/${id}`);
  return response.data;
};
