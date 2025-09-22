export interface Permission {
  id: number;
  name: string;
}

export interface PermissionApiResponse {
  data: Permission[];
  meta: {
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
