import api from './api';

export const getSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

export const getSettingGroups = async () => {
  const response = await api.get('/settings/groups');
  return response.data;
};

export const getSettingsByGroup = async (group: string) => {
  const response = await api.get(`/settings/group/${group}`);
  return response.data;
};

export const getSetting = async (key: string) => {
  const response = await api.get(`/settings/${key}`);
  return response.data;
};

export const updateSetting = async (key: string, value: any) => {
  const response = await api.post(`/settings/${key}`, { value });
  return response.data;
};

export const bulkUpdateSettings = async (settings: Record<string, any>) => {
  const response = await api.post('/settings', { settings });
  return response.data;
};

export const deleteSetting = async (key: string) => {
  const response = await api.delete(`/settings/${key}`);
  return response.data;
};
