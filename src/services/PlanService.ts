import api from './api';
import { PlanApiResponse } from '../types';

export const getPlans = async (page = 1, limit = 10, sortCol = 'created_at', sortDir = 'desc', unpaginated = false): Promise<PlanApiResponse> => {
  const url = unpaginated ? '/plan?unpaginated=1' : `/plan?perPage=${limit}&page=${page}&sort_by=${sortCol}&sort_direction=${sortDir}`;
  const response = await api.get(url);
  return response.data;
};

export const getPlan = async (id: number) => {
  const response = await api.get(`/plan/${id}`);
  return response.data;
};

export const createPlan = async (plan: any) => {
  const response = await api.post('/plan', plan);
  return response.data;
};

export const updatePlan = async (id: number, plan: any) => {
  const response = await api.post(`/plan/${id}`, plan);
  return response.data;
};

export const deletePlan = async (id: number) => {
  const response = await api.delete(`/plan/${id}`);
  return response.data;
};
