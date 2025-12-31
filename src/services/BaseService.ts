import api from './api';

export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  links?: unknown;
}

export interface QueryParams {
  page?: number;
  perPage?: number;
  sort_by?: string;
  sort_direction?: string;
  search?: string;
  from?: number;
  to?: number;
  trashed?: 'only' | 'with';
  unpaginated?: boolean | number;
  [key: string]: unknown;
}

export const createBaseService = <T, TInput = unknown>(endpoint: string) => {
  return {
    list: async (params: QueryParams = {}): Promise<PaginatedResponse<T>> => {
      const response = await api.get(endpoint, { params });
      return response.data;
    },

    get: async (id: number | string): Promise<T> => {
      const response = await api.get(`${endpoint}/${id}`);
      return response.data.data;
    },

    create: async (data: TInput): Promise<T> => {
      const response = await api.post(endpoint, data);
      return response.data.data;
    },

    update: async (id: number | string, data: TInput): Promise<T> => {
      const response = await api.put(`${endpoint}/${id}`, data);
      return response.data.data;
    },

    delete: async (id: number | string, force = false): Promise<unknown> => {
      const response = await api.delete(`${endpoint}/${id}${force ? '?force=1' : ''}`);
      return response.data;
    },

    restore: async (id: number | string): Promise<unknown> => {
      const response = await api.post(`${endpoint}/${id}/restore`);
      return response.data;
    },

    export: async (customEndpoint?: string) => {
      const url = customEndpoint || `${endpoint}/export/excel`;
      const response = await api.get(url, { responseType: 'blob' });
      return response;
    },

    import: async (file: File, customEndpoint?: string) => {
      const url = customEndpoint || `${endpoint}/import`;
      const formData = new FormData();
      formData.append('file', file);
      return await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },

    downloadSample: async (customEndpoint?: string) => {
      const url = customEndpoint || `${endpoint}/sample-excel`;
      const response = await api.get(url, { responseType: 'blob' });
      return response;
    },
  };
};
