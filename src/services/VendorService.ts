import { Vendor, VendorInput } from '../types';
import { createBaseService, QueryParams, PaginatedResponse } from './BaseService';

const vendorService = createBaseService<Vendor, VendorInput>('/vendor');

export const getVendors = (params: QueryParams = {}): Promise<PaginatedResponse<Vendor>> =>
  vendorService.list(params);

export const getVendor = (id: number): Promise<Vendor> => vendorService.get(id);

export const addVendor = (data: VendorInput) => vendorService.create(data);

export const updateVendor = (id: number, data: VendorInput) => vendorService.update(id, data);

export const deleteVendor = (id: number, force: boolean = false) => vendorService.delete(id, force);

export const restoreVendor = (id: number) => vendorService.restore(id);

export const exportVendors = () => vendorService.export('/vendor/export');

export const importVendors = (file: File) => vendorService.import(file);

export const downloadSampleVendorExcel = () => vendorService.downloadSample();

const VendorService = {
  ...vendorService,
  importVendors,
  downloadSampleVendorExcel,
};

export default VendorService;
