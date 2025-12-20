import { Role } from './Role';

export interface Address {
  type: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  meta: Record<string, unknown>;
}
export interface SocialLink {
  platform: string;
  url: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  phone: string | null;
  phone_verified_at?: string | null;
  status: string;
  status_updated_at?: string;
  is_admin: boolean;
  role: Role;
  permission_names: string[];
  alternate_email: string | null;
  alternate_phone: string | null;
  id_proof_type: string | null;
  id_proof_number: string | null;
  dob: string | null;
  gender: string | null;
  profile_image: string | null;
  addresses: Address[];
  social_links: SocialLink[];
  created_at: string;
}

export interface UserApiResponse {
  data: User[];
  meta: {
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export type UserUpdatePayload = Partial<Pick<User, 'name' | 'email' | 'phone' | 'status'>> & {
  role_id?: number;
};
export interface UserFormData {
  phone: string;
  role_id: number | string;
}
