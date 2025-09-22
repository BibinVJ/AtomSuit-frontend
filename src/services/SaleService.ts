
import api from './api';

import { SaleApiResponse, SalePayload } from '../types';

export const getSales = async (page = 1, limit = 10, sortCol = 'created_at', sortDir = 'desc'): Promise<SaleApiResponse> => {
  const response = await api.get(`/sale?perPage=${limit}&page=${page}&sort_by=${sortCol}&sort_direction=${sortDir}`);
  return response.data;
};

export const getSale = async (id: string) => {
    const response = await api.get(`/sale/${id}`);
    return response.data;
};

export const getNextInvoiceNumber = async () => {
    const response = await api.get('/sale/next-invoice-number');
    return response.data;
};

export const addSale = async (sale: SalePayload) => {
    const response = await api.post('/sale', sale);
    return response.data;
};

export const updateSale = async (id: string, sale: SalePayload) => {
    const response = await api.put(`/sale/${id}`, sale);
    return response.data;
};

export const voidSale = async (id: number) => {
    const response = await api.delete(`/sale/${id}`);
    return response.data;
};
