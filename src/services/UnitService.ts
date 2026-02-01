import { Unit, UnitInput } from '@/types';
import { createBaseService, QueryParams, PaginatedResponse } from './BaseService';

const unitService = createBaseService<Unit, UnitInput>('/units');

export const getUnits = (params: QueryParams = {}): Promise<PaginatedResponse<Unit>> =>
  unitService.list(params);

export const getUnit = (id: number): Promise<Unit> => unitService.get(id);

export const addUnit = (data: UnitInput) => unitService.create(data);

export const updateUnit = (id: number, data: UnitInput) => unitService.update(id, data);

export const deleteUnit = (id: number, force: boolean = false) => unitService.delete(id, force);

export const restoreUnit = (id: number) => unitService.restore(id);

export const exportUnits = () => unitService.export('/units/export');

const UnitService = {
  ...unitService,
};

export default UnitService;
