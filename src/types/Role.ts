import { Permission } from './Permission';

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}
export interface RoleApiResponse {
  data: Role[];
  meta: {
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}
