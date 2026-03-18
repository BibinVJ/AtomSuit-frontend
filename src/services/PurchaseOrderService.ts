import api from './api';
import { PurchaseOrder, PurchaseOrderInput, PurchaseOrderStatus } from '@/types/PurchaseOrder';
import { createBaseService } from './BaseService';

const baseService = createBaseService<PurchaseOrder, PurchaseOrderInput>('/purchase-orders');

export const getPurchaseOrders = baseService.list;
export const getPurchaseOrder = baseService.get;
export const addPurchaseOrder = baseService.create;
export const updatePurchaseOrder = baseService.update;
export const deletePurchaseOrder = baseService.delete;
export const restorePurchaseOrder = baseService.restore;

export const updatePurchaseOrderStatus = async (id: number, status: PurchaseOrderStatus) => {
  const response = await api.post(`/purchase-orders/${id}/status`, { status });
  return response.data;
};

export const getNextPurchaseOrderNumber = async () => {
  const response = await api.get('/purchase-orders/next-order-number');
  return response.data;
};

const PurchaseOrderService = {
  ...baseService,
  updateStatus: updatePurchaseOrderStatus,
  getNextPurchaseOrderNumber,
};

export default PurchaseOrderService;
