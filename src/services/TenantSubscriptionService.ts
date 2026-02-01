import api from './api';
import { Subscription } from '@/types';

export const getCurrentSubscription = async (): Promise<Subscription> => {
  const response = await api.get('/tenant-subscription/current');
  return response.data.data;
};

export const changePlan = async (planId: string): Promise<Subscription> => {
  const response = await api.post('/tenant-subscription/change-plan', { plan_id: planId });
  return response.data.data;
};

export const cancelSubscription = async (): Promise<Subscription> => {
  const response = await api.post('/tenant-subscription/cancel');
  return response.data.data;
};
