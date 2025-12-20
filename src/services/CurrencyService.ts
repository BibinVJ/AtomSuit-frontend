import { Currency, CurrencyInput } from '../types/Currency';
import api from './api';

export interface CurrencyApiResponse {
    data: Currency[];
    meta?: {
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    links?: any;
}

export const getCurrencies = async (params: {
    page?: number;
    perPage?: number;
    sort_by?: string;
    sort_direction?: string;
    from?: number;
    to?: number;
    search?: string;
    unpaginated?: boolean;
    trashed?: 'only' | 'with';
} = {}): Promise<CurrencyApiResponse> => {
    const {
        page = 1,
        perPage = 10,
        sort_by = 'created_at',
        sort_direction = 'desc',
        from,
        to,
        search,
        unpaginated = false,
        trashed,
    } = params;

    const requestParams: any = { perPage, page, sort_by, sort_direction };
    if (unpaginated) requestParams.unpaginated = 1;
    if (from !== undefined) requestParams.from = from;
    if (to !== undefined) requestParams.to = to;
    if (search) requestParams.search = search;
    if (trashed) requestParams.trashed = trashed;

    const response = await api.get(`/currency`, { params: requestParams });
    return response.data;
};

export const addCurrency = async (currency: CurrencyInput) => {
    const response = await api.post('/currency', currency);
    return response.data;
};

export const updateCurrency = async (id: number, currency: CurrencyInput) => {
    const response = await api.put(`/currency/${id}`, currency);
    return response.data;
};

export const deleteCurrency = async (id: number, force = false) => {
    const response = await api.delete(`/currency/${id}${force ? '?force=1' : ''}`);
    return response.data;
};

export const restoreCurrency = async (id: number) => {
    const response = await api.post(`/currency/${id}/restore`);
    return response.data;
};

export const exportCurrencies = async () => {
    const response = await api.get('/currency/export/excel', { responseType: 'blob' });
    return response;
};
