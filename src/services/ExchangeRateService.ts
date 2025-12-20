import { ExchangeRate, ExchangeRateInput } from '../types/ExchangeRate';
import api from './api';

export interface ExchangeRateApiResponse {
  data: ExchangeRate[];
  meta?: {
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  links?: any;
}

export const getExchangeRates = async (
  params: {
    page?: number;
    perPage?: number;
    sort_by?: string;
    sort_direction?: string;
    from?: number;
    to?: number;
    search?: string;
    unpaginated?: boolean;
    trashed?: 'only' | 'with';
    base_currency_id?: number;
    target_currency_id?: number;
  } = {}
): Promise<ExchangeRateApiResponse> => {
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
    base_currency_id,
    target_currency_id,
  } = params;

  const requestParams: any = { perPage, page, sort_by, sort_direction };
  if (unpaginated) requestParams.unpaginated = 1;
  if (from !== undefined) requestParams.from = from;
  if (to !== undefined) requestParams.to = to;
  if (search) requestParams.search = search;
  if (trashed) requestParams.trashed = trashed;
  if (base_currency_id) requestParams.base_currency_id = base_currency_id;
  if (target_currency_id) requestParams.target_currency_id = target_currency_id;

  const response = await api.get(`/exchange-rate`, { params: requestParams });
  return response.data;
};

export const addExchangeRate = async (exchangeRate: ExchangeRateInput) => {
  const response = await api.post('/exchange-rate', exchangeRate);
  return response.data;
};

export const updateExchangeRate = async (id: number, exchangeRate: ExchangeRateInput) => {
  const response = await api.put(`/exchange-rate/${id}`, exchangeRate);
  return response.data;
};

export const deleteExchangeRate = async (id: number, force = false) => {
  const response = await api.delete(`/exchange-rate/${id}${force ? '?force=1' : ''}`);
  return response.data;
};

export const restoreExchangeRate = async (id: number) => {
  const response = await api.post(`/exchange-rate/${id}/restore`);
  return response.data;
};

export const exportExchangeRates = async () => {
  const response = await api.get('/exchange-rate/export/excel', { responseType: 'blob' });
  return response;
};
