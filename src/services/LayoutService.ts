import api from './api';
import { Layout, LayoutApiResponse } from '../types';

export const getLayout = async (): Promise<LayoutApiResponse> => {
  const response = await api.get('/dashboard/layout');
  return response.data;
};

export const saveLayout = async (layouts: Layout[]) => {
  const response = await api.post('/dashboard/layout', { layouts });
  return response.data;
};

const LayoutService = {
  getLayout,
  saveLayout,
};

export default LayoutService;
