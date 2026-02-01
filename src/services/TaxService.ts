import { TaxRate, TaxRateInput, TaxGroup, TaxGroupInput } from '@/types';
import { createBaseService, QueryParams, PaginatedResponse } from './BaseService';

// -- Tax Rates --
const taxRateService = createBaseService<TaxRate, TaxRateInput>('/tax-rates');

export const getTaxRates = (params: QueryParams = {}): Promise<PaginatedResponse<TaxRate>> =>
  taxRateService.list(params);

export const getTaxRate = (id: number): Promise<TaxRate> => taxRateService.get(id);

export const addTaxRate = (data: TaxRateInput) => taxRateService.create(data);

export const updateTaxRate = (id: number, data: TaxRateInput) => taxRateService.update(id, data);

export const deleteTaxRate = (id: number, force: boolean = false) =>
  taxRateService.delete(id, force);

export const restoreTaxRate = (id: number) => taxRateService.restore(id);

// -- Tax Groups --
const taxGroupService = createBaseService<TaxGroup, TaxGroupInput>('/tax-groups');

export const getTaxGroups = (params: QueryParams = {}): Promise<PaginatedResponse<TaxGroup>> =>
  taxGroupService.list(params);

export const getTaxGroup = (id: number): Promise<TaxGroup> => taxGroupService.get(id);

export const addTaxGroup = (data: TaxGroupInput) => taxGroupService.create(data);

export const updateTaxGroup = (id: number, data: TaxGroupInput) => taxGroupService.update(id, data);

export const deleteTaxGroup = (id: number, force: boolean = false) =>
  taxGroupService.delete(id, force);

export const restoreTaxGroup = (id: number) => taxGroupService.restore(id);

const TaxService = {
  // Rates
  getTaxRates,
  getTaxRate,
  addTaxRate,
  updateTaxRate,
  deleteTaxRate,
  restoreTaxRate,
  // Groups
  getTaxGroups,
  getTaxGroup,
  addTaxGroup,
  updateTaxGroup,
  deleteTaxGroup,
  restoreTaxGroup,
};

export default TaxService;
