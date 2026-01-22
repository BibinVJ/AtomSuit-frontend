import { PaginatedResponse } from './Common';

export interface Unit {
  id: number;
  name: string;
  code: string;
  description: string;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UnitInput {
  name: string;
  code: string;
  description: string;
}

export type UnitApiResponse = PaginatedResponse<Unit>;
