import api from './api';
import { Sale, SaleInput } from '@/types';
import { createBaseService } from './BaseService';

const baseService = createBaseService<Sale, SaleInput>('/sales');

export const getSales = baseService.list;
export const getSale = baseService.get;
export const addSale = baseService.create;
export const updateSale = baseService.update;
export const deleteSale = baseService.delete;
export const exportSales = baseService.export;

export const getNextInvoiceNumber = async () => {
  const response = await api.get('/sales/next-invoice-number');
  return response.data;
};

export const voidSale = async (id: number) => {
  const response = await api.post(`/sales/${id}/void`);
  return response.data;
};

const SaleService = {
  ...baseService,
  getNextInvoiceNumber,
  voidSale,
};

export default SaleService;
