import api from './api';
import { Item, ItemApiResponse } from '../types';

export interface GetItemsParams {
    page?: number;
    limit?: number;
    sortCol?: string;
    sortDir?: string;
    from?: number;
    to?: number;
    search?: string;
    category_id?: string | number;
    unit_id?: string | number;
    type?: string;
    trashed?: string;
    unpaginated?: boolean;
}

export const getItems = async (params: GetItemsParams = {}): Promise<ItemApiResponse> => {
    const {
        page = 1,
        limit = 10,
        sortCol = 'created_at',
        sortDir = 'desc',
        from,
        to,
        search,
        category_id,
        unit_id,
        type,
        trashed,
        unpaginated
    } = params;

    const requestParams: any = { perPage: limit, page, sort_by: sortCol, sort_direction: sortDir };
    if (from !== undefined) requestParams.from = from;
    if (to !== undefined) requestParams.to = to;
    if (search) requestParams.search = search;
    if (category_id) requestParams.category_id = category_id;
    if (unit_id) requestParams.unit_id = unit_id;
    if (type) requestParams.type = type;
    if (trashed) requestParams.trashed = trashed;
    if (unpaginated !== undefined) requestParams.unpaginated = unpaginated;

    const response = await api.get(`/item`, { params: requestParams });
    return response.data;
};

export const getItem = async (id: string): Promise<Item> => {
    const response = await api.get(`/item/${id}`);
    return response.data.data;
};

export const addItem = async (item: { sku: string; name: string; category_id: string; unit_id: string; description: string; type: string; selling_price: number }) => {
    const response = await api.post('/item', item);
    return response.data;
};

export const updateItem = async (id: number, item: { sku: string; name: string; category_id: string; unit_id: string; description: string; type: string; selling_price: number }) => {
    const response = await api.put(`/item/${id}`, item);
    return response.data;
};

export const deleteItem = async (id: number, force: boolean = false) => {
    const response = await api.delete(`/item/${id}${force ? '?force=true' : ''}`);
    return response.data;
};

export const restoreItem = async (id: number) => {
    const response = await api.post(`/item/${id}/restore`);
    return response.data;
};

export const exportItems = async () => {
    const response = await api.get('/item/export', { responseType: 'blob' });
    return response;
};

export const importItems = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/item/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const downloadSampleItemExcel = async () => {
    const response = await api.get('/item/sample-excel', { responseType: 'blob' });
    return response;
};
