import api from './api';
import { CustomerApiResponse } from '../types';

export const getCustomers = async (params: {
    page?: number;
    limit?: number;
    sortCol?: string;
    sortDir?: string;
    from?: number;
    to?: number;
    search?: string;
    trashed?: 'only' | 'with';
} = {}): Promise<CustomerApiResponse> => {
    const {
        page = 1,
        limit = 10,
        sortCol = 'created_at',
        sortDir = 'desc',
        from,
        to,
        search,
        trashed,
    } = params;

    const requestParams: any = { perPage: limit, page, sort_by: sortCol, sort_direction: sortDir };
    if (from !== undefined) requestParams.from = from;
    if (to !== undefined) requestParams.to = to;
    if (search) requestParams.search = search;
    if (trashed) requestParams.trashed = trashed;

    const response = await api.get(`/customer`, { params: requestParams });
    return response.data;
};

export const addCustomer = async (customer: { name: string; email: string; phone: string; address: string; }) => {
    const response = await api.post('/customer', customer);
    return response.data;
};

export const updateCustomer = async (id: number, customer: { name: string; email: string; phone: string; address: string; }) => {
    const response = await api.put(`/customer/${id}`, customer);
    return response.data;
};

export const deleteCustomer = async (id: number, force = false) => {
    const response = await api.delete(`/customer/${id}${force ? '?force=1' : ''}`);
    return response.data;
};

export const restoreCustomer = async (id: number) => {
    const response = await api.post(`/customer/${id}/restore`);
    return response.data;
};

export const exportCustomers = async () => {
    const response = await api.get('/customer/export', { responseType: 'blob' });
    return response;
};

export const importCustomers = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post('/customer/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const downloadSampleCustomerExcel = async () => {
    const response = await api.get('/customer/sample-excel', { responseType: 'blob' });
    return response;
};
