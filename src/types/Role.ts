import { Permission } from './Permission';
import { PaginatedResponse } from './Common';

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
  deleted_at?: string;
}

export type RoleApiResponse = PaginatedResponse<Role>;
