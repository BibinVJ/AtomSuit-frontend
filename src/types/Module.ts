/** How a tenant came to have a module. */
export type ModuleSource = 'plan' | 'admin' | 'purchased';

/** Verticals/capabilities ('module') vs third-party connections ('integration'). */
export type ModuleType = 'module' | 'integration';

export interface Module {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  type: ModuleType;
  is_active: boolean;
  /** Only present when listed for a specific tenant. */
  is_enabled?: boolean;
  source?: ModuleSource | null;
  enabled_at?: string | null;
}
