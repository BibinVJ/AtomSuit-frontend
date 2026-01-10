import { Customer, CustomerInput } from '../types';
import { createBaseService, QueryParams, PaginatedResponse } from './BaseService';

const customerService = createBaseService<Customer, CustomerInput>('/customers');

export const getCustomers = (params: QueryParams = {}): Promise<PaginatedResponse<Customer>> =>
  customerService.list(params);

export const getCustomer = (id: number): Promise<Customer> => customerService.get(id);

export const addCustomer = (data: CustomerInput) => customerService.create(data);

export const updateCustomer = (id: number, data: CustomerInput) => customerService.update(id, data);

export const deleteCustomer = (id: number, force: boolean = false) =>
  customerService.delete(id, force);

export const restoreCustomer = (id: number) => customerService.restore(id);

export const exportCustomers = () => customerService.export('/customers/export');

export const importCustomers = (file: File) => customerService.import(file);

export const downloadSampleCustomerExcel = () => customerService.downloadSample();

const CustomerService = {
  ...customerService,
  importCustomers,
  downloadSampleCustomerExcel,
};

export default CustomerService;
