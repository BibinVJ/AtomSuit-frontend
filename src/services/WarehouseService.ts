import { Warehouse, WarehouseInput } from '../types/Warehouse';
import axios from './api';

interface GetWarehousesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortCol?: string;
  sortDir?: string;
  trashed?: 'with' | 'only';
  unpaginated?: boolean;
}

interface WarehouseResponse {
  data: Warehouse[];
  meta: {
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    per_page: number;
  };
}

export const getWarehouses = async (params: GetWarehousesParams): Promise<WarehouseResponse> => {
  const { data } = await axios.get('/warehouse', {
    params: {
      ...params,
      perPage: params.limit,
      sort_by: params.sortCol,
      sort_direction: params.sortDir,
    },
  });
  return data;
};

export const getWarehouse = async (id: number): Promise<Warehouse> => {
  const { data } = await axios.get(`/warehouse/${id}`);
  return data.data;
};

export const createWarehouse = async (warehouse: WarehouseInput): Promise<Warehouse> => {
  const { data } = await axios.post('/warehouse', warehouse);
  return data.data;
};

export const updateWarehouse = async (
  id: number,
  warehouse: WarehouseInput
): Promise<Warehouse> => {
  const { data } = await axios.put(`/warehouse/${id}`, warehouse);
  return data.data;
};

export const deleteWarehouse = async (id: number): Promise<void> => {
  await axios.delete(`/warehouse/${id}`);
};

export const restoreWarehouse = async (id: number): Promise<void> => {
  await axios.post(`/warehouse/${id}/restore`);
};

export const exportWarehouses = async (): Promise<Blob> => {
  const { data } = await axios.get('/warehouse/export', { responseType: 'blob' });
  return data;
};

export const importWarehouses = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);
  await axios.post('/warehouse/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const downloadSampleWarehouseExcel = async (): Promise<Blob> => {
  const { data } = await axios.get('/warehouse/sample-excel', { responseType: 'blob' });
  return data;
};
