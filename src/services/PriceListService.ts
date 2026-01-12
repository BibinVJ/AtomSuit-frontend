import api from './api';
import { PriceList } from '../types/PriceList';

const BASE_URL = '/price-lists';

export const getPriceLists = async (params: any = {}) => {
  const response = await api.get(BASE_URL, { params });
  return response.data;
};

export const getPriceList = async (id: number) => {
  const response = await api.get(`${BASE_URL}/${id}`);
  return response.data.data;
};

export const createPriceList = async (data: Partial<PriceList>) => {
  const response = await api.post(BASE_URL, data);
  return response.data.data;
};

export const updatePriceList = async (id: number, data: Partial<PriceList>) => {
  const response = await api.put(`${BASE_URL}/${id}`, data);
  return response.data.data;
};

export const deletePriceList = async (id: number, force: boolean = false) => {
  const response = await api.delete(`${BASE_URL}/${id}`, { params: { force } });
  return response.data;
};

export const restorePriceList = async (id: number) => {
  const response = await api.post(`${BASE_URL}/${id}/restore`);
  return response.data.data;
};

export const exportPriceLists = async () => {
  const response = await api.get(`${BASE_URL}/export/excel`, {
    responseType: 'blob',
  });
  return response.data;
};
