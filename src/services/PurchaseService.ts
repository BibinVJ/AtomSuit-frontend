import api from './api';
import { Purchase, PurchaseInput } from '../types';
import { createBaseService } from './BaseService';

const baseService = createBaseService<Purchase, PurchaseInput>('/purchase');

export const getPurchases = baseService.list;
export const getPurchase = baseService.get;
export const addPurchase = baseService.create;
export const updatePurchase = baseService.update;
export const deletePurchase = baseService.delete;
export const exportPurchases = baseService.export;
export const voidPurchase = async (id: number) => {
  const response = await api.post(`/purchase/${id}/void`);
  return response.data;
};
export const importPurchases = baseService.import;
export const downloadSamplePurchaseExcel = baseService.downloadSample;

export const getNextPurchaseInvoiceNumber = async () => {
  const response = await api.get('/purchase/next-invoice-number');
  return response.data;
};

const PurchaseService = {
  ...baseService,
  getNextPurchaseInvoiceNumber,
};

export default PurchaseService;
