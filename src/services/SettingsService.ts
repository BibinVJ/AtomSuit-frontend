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

export const updateSetting = async (key: string, value: any, type?: string, group?: string) => {
  const formData = new FormData();
  
  if (value instanceof File) {
    formData.append('value', value);
  } else if (typeof value === 'object' && value !== null) {
    formData.append('value', JSON.stringify(value));
  } else {
    formData.append('value', value);
  }
  
  if (type) formData.append('type', type);
  if (group) formData.append('group', group);
  
  const response = await api.post(`/settings/${key}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const bulkUpdateSettings = async (settings: Record<string, any>) => {
  const response = await api.post('/settings', settings);
  return response.data;
};

export const deleteSettingFile = async (key: string) => {
  const response = await api.delete(`/settings/${key}/file`);
  return response.data;
};

export const deleteSetting = async (key: string) => {
  const response = await api.delete(`/settings/${key}`);
  return response.data;
};
