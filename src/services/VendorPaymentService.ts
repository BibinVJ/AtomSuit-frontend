import api from './api';
import { createBaseService } from './BaseService';
import { VendorPayment, VendorPaymentPayload } from '@/types/VendorPayment';

const baseService = createBaseService<VendorPayment, VendorPaymentPayload>('vendor-payments');

export const VendorPaymentService = {
  ...baseService,

  async getNextPaymentNumber() {
    const response = await api.get('vendor-payments/next-payment-number');
    return response.data;
  },
};

export default VendorPaymentService;
