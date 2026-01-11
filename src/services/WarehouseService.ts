import { Warehouse, WarehouseInput } from '../types/Warehouse';
import { createBaseService, PaginatedResponse, QueryParams } from './BaseService';

const warehouseService = createBaseService<Warehouse, WarehouseInput>('/warehouses');

export const getWarehouses = (params: QueryParams = {}): Promise<PaginatedResponse<Warehouse>> =>
  warehouseService.list(params);

export const getWarehouse = (id: number): Promise<Warehouse> => warehouseService.get(id);

export const createWarehouse = (data: WarehouseInput): Promise<Warehouse> =>
  warehouseService.create(data);

export const updateWarehouse = (id: number, data: WarehouseInput): Promise<Warehouse> =>
  warehouseService.update(id, data);

export const deleteWarehouse = (id: number, force: boolean = false): Promise<unknown> =>
  warehouseService.delete(id, force);

export const restoreWarehouse = (id: number): Promise<unknown> => warehouseService.restore(id);

export const exportWarehouses = () => warehouseService.export('/warehouses/export');

export const importWarehouses = (file: File) => warehouseService.import(file);

export const downloadSampleWarehouseExcel = () => warehouseService.downloadSample();

const WarehouseService = {
  ...warehouseService,
  getWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  restoreWarehouse,
  exportWarehouses,
  importWarehouses,
  downloadSampleWarehouseExcel,
};

export default WarehouseService;
