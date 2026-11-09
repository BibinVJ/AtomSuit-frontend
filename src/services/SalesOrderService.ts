import api from './api';
import { SalesOrder, SalesOrderInput, SalesOrderStatus } from '@/types/SalesOrder';
import { createBaseService } from './BaseService';

const baseService = createBaseService<SalesOrder, SalesOrderInput>('/sales-orders');

export const getSalesOrders = baseService.list;
export const getSalesOrder = baseService.get;
export const addSalesOrder = baseService.create;
export const updateSalesOrder = baseService.update;
export const deleteSalesOrder = baseService.delete;
export const restoreSalesOrder = baseService.restore;

export const updateSalesOrderStatus = async (id: number, status: SalesOrderStatus) => {
  const response = await api.post(`/sales-orders/${id}/status`, { status });
  return response.data;
};

export const getNextSalesOrderNumber = async () => {
  const response = await api.get('/sales-orders/next-order-number');
  return response.data;
};

const SalesOrderService = {
  ...baseService,
  updateStatus: updateSalesOrderStatus,
  getNextSalesOrderNumber,
};

export default SalesOrderService;
