import { CategoryApiResponse } from '../types';
import api from './api';

export const getCategories = async (
  params: {
    page?: number;
    limit?: number;
    sortCol?: string;
    sortDir?: string;
    from?: number;
    to?: number;
    search?: string;
    unpaginated?: boolean;
    trashed?: 'only' | 'with';
  } = {}
): Promise<CategoryApiResponse> => {
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

  const response = await api.get(`/category`, { params: requestParams });
  return response.data;
};

export const addCategory = async (category: { name: string; description: string }) => {
  const response = await api.post('/category', category);
  return response.data;
};

export const updateCategory = async (
  id: number,
  category: { name: string; description: string }
) => {
  const response = await api.put(`/category/${id}`, category);
  return response.data;
};

export const deleteCategory = async (id: number, force = false) => {
  const response = await api.delete(`/category/${id}${force ? '?force=1' : ''}`);
  return response.data;
};

export const restoreCategory = async (id: number) => {
  const response = await api.post(`/category/${id}/restore`);
  return response.data;
};

export const exportCategories = async () => {
  const response = await api.get('/category/export', { responseType: 'blob' });
  return response;
};

export const importCategories = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return await api.post('/category/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const downloadSampleCategoryExcel = async () => {
  const response = await api.get('/category/sample-excel', { responseType: 'blob' });
  return response;
};
