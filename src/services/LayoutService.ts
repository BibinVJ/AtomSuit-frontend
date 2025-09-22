import api from './api';
import { Layout } from '../types';

export const getLayout = () => {
  return api.get('/dashboard/layout');
};

export const saveLayout = (layouts: Layout[]) => {
  return api.post('/dashboard/layout', { layouts });
};
