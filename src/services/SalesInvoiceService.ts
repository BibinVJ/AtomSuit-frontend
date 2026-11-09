import api from './api';
import { createBaseService } from './BaseService';
import { SalesInvoice, SalesInvoicePayload } from '@/types/SalesInvoice';

const baseService = createBaseService<SalesInvoice, SalesInvoicePayload>('sales-invoices');

export const SalesInvoiceService = {
  ...baseService,

  async getNextInvoiceNumber() {
    const response = await api.get('sales-invoices/next-invoice-number');
    return response.data;
  },
};

export default SalesInvoiceService;
