import { ItemPrice } from '../types';
import { createBaseService, QueryParams, PaginatedResponse } from './BaseService';

const itemPriceService = createBaseService<ItemPrice, Partial<ItemPrice>>('/item-prices');

export const getItemPrices = (params: QueryParams = {}): Promise<PaginatedResponse<ItemPrice>> =>
  itemPriceService.list(params);

export const getItemPrice = (id: number): Promise<ItemPrice> => itemPriceService.get(id);

export const createItemPrice = (data: Partial<ItemPrice>) => itemPriceService.create(data);

export const updateItemPrice = (id: number, data: Partial<ItemPrice>) =>
  itemPriceService.update(id, data);

export const deleteItemPrice = (id: number, force: boolean = false) =>
  itemPriceService.delete(id, force);

export const restoreItemPrice = (id: number) => itemPriceService.restore(id);

export const exportItemPrices = () => itemPriceService.export('/item-prices/export/excel');

const ItemPriceService = {
  ...itemPriceService,
};

export default ItemPriceService;
