export enum CostCenterType {
  BRANCH = 'BRANCH',
  DEPARTMENT = 'DEPARTMENT',
  PROJECT = 'PROJECT',
  BRAND = 'BRAND',
  REGION = 'REGION',
}

export interface CostCenter {
  id: number;
  code: string;
  name: string;
  type: CostCenterType;
  parent_id?: number | null;
  parent?: CostCenter;
  warehouse_id?: number | null;
  warehouse?: {
    id: number;
    name: string;
  };
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  status?: boolean;
}

export interface CostCenterInput {
  code: string;
  name: string;
  type: CostCenterType;
  parent_id?: number | null;
  warehouse_id?: number | null;
}
