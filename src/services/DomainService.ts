import api from './api';
import { DomainApiResponse } from '../types';

export const getDomains = async (
  page = 1,
  limit = 10,
  sortCol = 'domain',
  sortDir = 'asc',
  filters: any = {}
): Promise<DomainApiResponse> => {
  const params = new URLSearchParams({
    perPage: limit.toString(),
    page: page.toString(),
    sort_by: sortCol,
    sort_direction: sortDir,
    ...filters,
  });
  const response = await api.get(`/domain?${params.toString()}`);
  return response.data;
};