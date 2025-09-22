
import api from './api';

import { VendorApiResponse } from '../types';

export const getVendors = async (page = 1, limit = 10, sortCol = 'created_at', sortDir = 'desc', unpaginated = false): Promise<VendorApiResponse> => {
  const url = unpaginated ? '/vendor?unpaginated=1' : `/vendor?perPage=${limit}&page=${page}&sort_by=${sortCol}&sort_direction=${sortDir}`;
  const response = await api.get(url);
  return response.data;
};

export const addVendor = async (vendor: { name: string; email: string; phone: string; address: string; is_active: boolean; }) => {
    const response = await api.post('/vendor', vendor);
    return response.data;
};

export const updateVendor = async (id: number, vendor: { name: string; email: string; phone: string; address: string; is_active: boolean; }) => {
    const response = await api.put(`/vendor/${id}`, vendor);
    return response.data;
};

export const deleteVendor = async (id: number) => {
    const response = await api.delete(`/vendor/${id}`);
    return response.data;
};
