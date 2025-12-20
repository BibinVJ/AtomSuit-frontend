import api from './api';
import { VendorApiResponse } from '../types';

export const getVendors = async (params: {
    page?: number;
    limit?: number;
    sortCol?: string;
    sortDir?: string;
    from?: number;
    to?: number;
    search?: string;
    trashed?: 'only' | 'with';
} = {}): Promise<VendorApiResponse> => {
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

    const response = await api.get(`/vendor`, { params: requestParams });
    return response.data;
};

export const addVendor = async (vendor: { name: string; email: string; phone: string; address: string; }) => {
    const response = await api.post('/vendor', vendor);
    return response.data;
};

export const updateVendor = async (id: number, vendor: { name: string; email: string; phone: string; address: string; }) => {
    const response = await api.put(`/vendor/${id}`, vendor);
    return response.data;
};

export const deleteVendor = async (id: number, force = false) => {
    const response = await api.delete(`/vendor/${id}${force ? '?force=1' : ''}`);
    return response.data;
};

export const restoreVendor = async (id: number) => {
    const response = await api.post(`/vendor/${id}/restore`);
    return response.data;
};

export const exportVendors = async () => {
    const response = await api.get('/vendor/export', { responseType: 'blob' });
    return response;
};

export const importVendors = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post('/vendor/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const downloadSampleVendorExcel = async () => {
    const response = await api.get('/vendor/sample-excel', { responseType: 'blob' });
    return response;
};
