import { ApiResponse } from './Common';

export interface Layout {
  id?: number;
  dashboard_card_id: number;
  slug?: string;
  area?: string | null;
  x: number;
  y: number;
  rotation?: number | null;
  width?: number;
  height?: number;
  col_span?: number | null;
  draggable?: boolean;
  visible: boolean;
  config?: Record<string, unknown>;

  // react-grid-layout properties
  i: string;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  static?: boolean;
  // component rendering properties
  component?: string;
  props?: Record<string, unknown>;
}

export type LayoutApiResponse = ApiResponse<Layout[]>;

export interface BackendLayoutItem {
  slug?: string;
  dashboard_card_id?: number;
  width?: number;
  default_width?: number;
  height?: number;
  default_height?: number;
  x?: number;
  y?: number;
  visible?: boolean;
  component?: string;
  [key: string]: unknown;
}
