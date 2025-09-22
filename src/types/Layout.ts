export interface Layout {
  id?: number;
  card_id: string;
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
