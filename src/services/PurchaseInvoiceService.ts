import api from './api';
import { createBaseService } from './BaseService';
import { PurchaseInvoice, PurchaseInvoicePayload } from '@/types/PurchaseInvoice';

const baseService = createBaseService<PurchaseInvoice, PurchaseInvoicePayload>('purchase-invoices');

export const PurchaseInvoiceService = {
  ...baseService,

  async getNextInvoiceNumber() {
    const response = await api.get('purchase-invoices/next-invoice-number');
    return response.data;
  },
};

export default PurchaseInvoiceService;
