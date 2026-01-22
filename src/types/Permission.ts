import { PaginatedResponse } from './Common';

export interface Permission {
  id: number;
  name: string;
}

export type PermissionApiResponse = PaginatedResponse<Permission>;
