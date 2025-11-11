import api from './api';

export const getDomains = async (page = 1, limit = 10) => {
  const response = await api.get(`/domain?perPage=${limit}&page=${page}`);
  return response.data;
};
