import api from './api';
import { SubscriptionApiResponse } from '../types';

export const getSubscriptions = async (
  page = 1,
  limit = 10,
  sortCol = 'created_at',
  sortDir = 'desc',
  filters: any = {}
): Promise<SubscriptionApiResponse> => {
  const params = new URLSearchParams({
    perPage: limit.toString(),
    page: page.toString(),
    sort_by: sortCol,
    sort_direction: sortDir,
    ...filters,
  });
  const response = await api.get(`/subscription?${params.toString()}`);
  return response.data;
};

export const getSubscription = async (id: number) => {
  const response = await api.get(`/subscription/${id}`);
  return response.data;
};

export const cancelSubscription = async (id: number) => {
  const response = await api.delete(`/subscription/${id}`);
  return response.data;
};
