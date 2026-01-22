import { Tenant } from './Tenant';

export interface Domain {
  id: number;
  tenant_id?: number | string;
  domain: string;
  is_primary?: boolean;
  tenant?: Tenant;
  created_at?: string;
  updated_at?: string;
}

import { ApiResponse } from './Common';

export type DomainApiResponse = ApiResponse<Domain>;
