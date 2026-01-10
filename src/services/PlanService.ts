import api from './api';
import { Plan, PlanInput } from '../types';
import { createBaseService } from './BaseService';

const baseService = createBaseService<Plan, PlanInput>('/plans');

export const getPlans = baseService.list;
export const getPlan = baseService.get;
export const createPlan = baseService.create;
export const updatePlan = (id: number | string, data: PlanInput) =>
  api.post(`/plans/${id}`, data).then((res) => res.data);
export const deletePlan = baseService.delete;

const PlanService = {
  ...baseService,
  updatePlan, // Plan update uses POST instead of PUT/PATCH in the original code
};

export default PlanService;
