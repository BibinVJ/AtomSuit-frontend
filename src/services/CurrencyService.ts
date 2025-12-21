import api from './api';
import { Currency, CurrencyInput } from '../types';
import { createBaseService, QueryParams, PaginatedResponse } from './BaseService';

const currencyService = createBaseService<Currency, CurrencyInput>('/currency');

export const getCurrencies = (params: QueryParams = {}): Promise<PaginatedResponse<Currency>> =>
  currencyService.list(params);

export const getCurrency = (id: number): Promise<Currency> => currencyService.get(id);

export const addCurrency = (data: CurrencyInput) => currencyService.create(data);

export const updateCurrency = (id: number, data: CurrencyInput) => currencyService.update(id, data);

export const deleteCurrency = (id: number, force: boolean = false) =>
  currencyService.delete(id, force);

export const restoreCurrency = (id: number) => currencyService.restore(id);

export const exportCurrencies = () => currencyService.export('/currency/export');

export const getDefaultCurrency = async () => {
  const response = await api.get('/currency/default');
  return response.data.data;
};

export const setAsDefaultCurrency = async (id: number) => {
  const response = await api.post(`/currency/${id}/set-default`);
  return response.data;
};

const CurrencyService = {
  ...currencyService,
  getDefaultCurrency,
  setAsDefaultCurrency,
};

export default CurrencyService;
