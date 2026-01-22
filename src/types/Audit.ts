import { PaginatedResponse } from './Common';

export interface AuditEntry {
  id: number;
  log_name: string;
  description: string;
  subject_type: string;
  subject_id: string | number;
  causer_type: string;
  causer_id: number;
  event: string;
  properties: {
    attributes?: Record<string, unknown>;
    old?: Record<string, unknown>;
  };
  created_at: string;
  updated_at: string;
  causer?: {
    name: string;
  };
  subject?: {
    name?: string;
    id?: string | number;
  };
}

export type AuditApiResponse = PaginatedResponse<AuditEntry>;
