import { ExchangeRate, ExchangeRateInput } from '@/types';
import { createBaseService, QueryParams, PaginatedResponse } from './BaseService';

export interface ExchangeRateQueryParams extends QueryParams {
  currency_id?: number | string;
}

const exchangeRateService = createBaseService<ExchangeRate, ExchangeRateInput>('/exchange-rates');

export const getExchangeRates = (
  params: ExchangeRateQueryParams = {}
): Promise<PaginatedResponse<ExchangeRate>> => exchangeRateService.list(params);

export const getExchangeRate = (id: number): Promise<ExchangeRate> => exchangeRateService.get(id);

export const addExchangeRate = (data: ExchangeRateInput) => exchangeRateService.create(data);

export const updateExchangeRate = (id: number, data: ExchangeRateInput) =>
  exchangeRateService.update(id, data);

export const deleteExchangeRate = (id: number, force: boolean = false) =>
  exchangeRateService.delete(id, force);

export const restoreExchangeRate = (id: number) => exchangeRateService.restore(id);

export const exportExchangeRates = () => exchangeRateService.export('/exchange-rate/export');

const ExchangeRateService = {
  ...exchangeRateService,
};

export default ExchangeRateService;
