import api from './api';
import { createBaseService } from './BaseService';
import { CustomerPayment, CustomerPaymentPayload } from '@/types/CustomerPayment';

const baseService = createBaseService<CustomerPayment, CustomerPaymentPayload>('customer-payments');

export const CustomerPaymentService = {
  ...baseService,

  async getNextPaymentNumber() {
    const response = await api.get('customer-payments/next-payment-number');
    return response.data;
  },
};

export default CustomerPaymentService;
