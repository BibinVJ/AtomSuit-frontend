import { PriceList } from '../types/PriceList';
import { createBaseService, QueryParams, PaginatedResponse } from './BaseService';

const priceListService = createBaseService<PriceList, Partial<PriceList>>('/price-lists');

export const getPriceLists = (params: QueryParams = {}): Promise<PaginatedResponse<PriceList>> =>
  priceListService.list(params);

export const getPriceList = (id: number): Promise<PriceList> => priceListService.get(id);

export const createPriceList = (data: Partial<PriceList>) => priceListService.create(data);

export const updatePriceList = (id: number, data: Partial<PriceList>) =>
  priceListService.update(id, data);

export const deletePriceList = (id: number, force: boolean = false) =>
  priceListService.delete(id, force);

export const restorePriceList = (id: number) => priceListService.restore(id);

export const exportPriceLists = () => priceListService.export('/price-lists/export/excel');

const PriceListService = {
  ...priceListService,
};

export default PriceListService;
