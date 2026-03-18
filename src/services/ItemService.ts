import { Item, ItemInput } from '@/types';
import { createBaseService, QueryParams, PaginatedResponse } from './BaseService';

export interface ItemQueryParams extends QueryParams {
  category_id?: string | number;
  unit_id?: string | number;
  type?: string;
}

const itemService = createBaseService<Item, ItemInput>('/items');

export const getItems = (params: ItemQueryParams = {}): Promise<PaginatedResponse<Item>> =>
  itemService.list(params);

export const getItem = (id: string | number): Promise<Item> => itemService.get(id);

export const addItem = (item: ItemInput) => itemService.create(item);

export const updateItem = (id: number, item: ItemInput) => itemService.update(id, item);

export const deleteItem = (id: number, force: boolean = false) => itemService.delete(id, force);

export const restoreItem = (id: number) => itemService.restore(id);

export const exportItems = () => itemService.export('/items/export');

export const importItems = (file: File) => itemService.import(file, '/items/import');

export const downloadSampleItemExcel = () => itemService.downloadSample('/items/sample-excel');

export default itemService;
