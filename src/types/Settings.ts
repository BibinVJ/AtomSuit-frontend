export interface Setting {
  id: number;
  key: string;
  value: unknown;
  type: 'string' | 'integer' | 'boolean' | 'json' | 'file';
  group: string;
  description?: string;
  file_url?: string;
  created_at: string;
  updated_at: string;
}

import { ApiResponse } from './Common';

export type SettingApiResponse = ApiResponse<Setting | string>;
