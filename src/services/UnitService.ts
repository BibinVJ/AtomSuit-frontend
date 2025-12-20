import api from './api';
import { UnitApiResponse } from '../types';

export const getUnits = async (
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
): Promise<UnitApiResponse> => {
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

  const response = await api.get(`/unit`, { params: requestParams });
  return response.data;
};

export const addUnit = async (unit: { name: string; code: string; description: string }) => {
  const response = await api.post('/unit', unit);
  return response.data;
};

export const updateUnit = async (
  id: number,
  unit: { name: string; code: string; description: string }
) => {
  const response = await api.put(`/unit/${id}`, unit);
  return response.data;
};

export const deleteUnit = async (id: number, force = false) => {
  const response = await api.delete(`/unit/${id}${force ? '?force=1' : ''}`);
  return response.data;
};

export const restoreUnit = async (id: number) => {
  const response = await api.post(`/unit/${id}/restore`);
  return response.data;
};

export const exportUnits = async () => {
  const response = await api.get('/unit/export', { responseType: 'blob' });
  return response;
};

export const importUnits = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return await api.post('/unit/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const downloadSampleUnitExcel = async () => {
  const response = await api.get('/unit/sample-excel', { responseType: 'blob' });
  return response;
};
