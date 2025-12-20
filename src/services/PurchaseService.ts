import api from './api';
import { PurchaseApiResponse } from '../types';

export const getPurchases = async (
    page = 1,
    limit = 10,
    sortCol = 'created_at',
    sortDir = 'desc',
    from?: number,
    to?: number,
    search?: string
): Promise<PurchaseApiResponse> => {
    const params: any = { perPage: limit, page, sort_by: sortCol, sort_direction: sortDir };
    if (from !== undefined) params.from = from;
    if (to !== undefined) params.to = to;
    if (search) params.search = search;
    const response = await api.get(`/purchase`, { params });
    return response.data;
};

export const getPurchase = async (id: string) => {
    const response = await api.get(`/purchase/${id}`);
    return response.data.data;
};

export const addPurchase = async (purchase: any) => {
    const response = await api.post('/purchase', purchase);
    return response.data;
};

export const updatePurchase = async (id: number | string, purchase: any) => {
    const response = await api.put(`/purchase/${id}`, purchase);
    return response.data;
};

export const getNextPurchaseInvoiceNumber = async () => {
    const response = await api.get('/purchase/next-invoice-number');
    return response.data;
};

export const deletePurchase = async (id: number) => {
    const response = await api.delete(`/purchase/${id}`);
    return response.data;
};

export const exportPurchases = async () => {
    const response = await api.get('/purchase/export', { responseType: 'blob' });
    return response;
};

export const importPurchases = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post('/purchase/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const downloadSamplePurchaseExcel = async () => {
    const response = await api.get('/purchase/sample-excel', { responseType: 'blob' });
    return response;
};
