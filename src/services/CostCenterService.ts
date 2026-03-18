import { createBaseService } from './BaseService';
import { CostCenter, CostCenterInput } from '@/types/CostCenter';

const baseService = createBaseService<CostCenter, CostCenterInput>('/cost-centers');

export const getCostCenters = baseService.list;
export const getCostCenter = baseService.get;
export const addCostCenter = baseService.create;
export const updateCostCenter = baseService.update;
export const deleteCostCenter = baseService.delete;
export const restoreCostCenter = baseService.restore;
export const exportCostCenters = baseService.export;
export const importCostCenters = baseService.import;
export const downloadCostCenterSample = baseService.downloadSample;

const CostCenterService = {
  ...baseService,
};

export default CostCenterService;
