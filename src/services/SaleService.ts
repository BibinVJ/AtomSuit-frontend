import api from './api';
import { SaleApiResponse } from '../types';

export const getSales = async (
    page = 1,
    limit = 10,
    sortCol = 'created_at',
    sortDir = 'desc',
    from?: number,
    to?: number,
    search?: string
): Promise<SaleApiResponse> => {
    const params: any = { perPage: limit, page, sort_by: sortCol, sort_direction: sortDir };
    if (from !== undefined) params.from = from;
    if (to !== undefined) params.to = to;
    if (search) params.search = search;
    const response = await api.get(`/sale`, { params });
    return response.data;
};

export const getSale = async (id: string) => {
    const response = await api.get(`/sale/${id}`);
    return response.data.data;
};

export const addSale = async (sale: any) => {
    const response = await api.post('/sale', sale);
    return response.data;
};

export const updateSale = async (id: number | string, sale: any) => {
    const response = await api.put(`/sale/${id}`, sale);
    return response.data;
};

export const getNextInvoiceNumber = async () => {
    const response = await api.get('/sale/next-invoice-number');
    return response.data;
};

export const deleteSale = async (id: number) => {
    const response = await api.delete(`/sale/${id}`);
    return response.data;
};

export const exportSales = async () => {
    const response = await api.get('/sale/export', { responseType: 'blob' });
    return response;
};
