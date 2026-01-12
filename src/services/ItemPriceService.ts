import api from './api';
import { ItemPrice } from '../types/ItemPrice';

const BASE_URL = '/item-prices';

export const getItemPrices = async (params: any = {}) => {
  const response = await api.get(BASE_URL, { params });
  return response.data;
};

export const getItemPrice = async (id: number) => {
  const response = await api.get(`${BASE_URL}/${id}`);
  return response.data.data;
};

export const createItemPrice = async (data: Partial<ItemPrice>) => {
  const response = await api.post(BASE_URL, data);
  return response.data.data;
};

export const updateItemPrice = async (id: number, data: Partial<ItemPrice>) => {
  const response = await api.put(`${BASE_URL}/${id}`, data);
  return response.data.data;
};

export const deleteItemPrice = async (id: number, force: boolean = false) => {
  const response = await api.delete(`${BASE_URL}/${id}`, { params: { force } });
  return response.data;
};

export const restoreItemPrice = async (id: number) => {
  const response = await api.post(`${BASE_URL}/${id}/restore`);
  return response.data.data;
};

export const exportItemPrices = async () => {
  const response = await api.get(`${BASE_URL}/export/excel`, {
    responseType: 'blob',
  });
  return response.data;
};
