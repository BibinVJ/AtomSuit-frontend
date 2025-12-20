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
    attributes?: Record<string, any>;
    old?: Record<string, any>;
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

export interface AuditApiResponse {
  data: AuditEntry[];
  meta: {
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}
