import { User } from '@/types';

const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  email_verified_at: '2023-01-01T00:00:00Z',
  phone: '+1234567890',
  phone_verified_at: '2023-01-01T00:00:00Z',
  status: 'active',
  status_updated_at: '2023-01-01T00:00:00Z',
  is_admin: false,
  role: {
    id: 1,
    name: 'User',
    permissions: [],
  },
  permission_names: ['read', 'write'],
  alternate_email: null,
  alternate_phone: null,
  id_proof_type: null,
  id_proof_number: null,
  dob: null,
  gender: null,
  profile_image: null,
  addresses: [],
  social_links: [],
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

export const login = async () =>
  Promise.resolve({
    data: {
      user: mockUser,
      token: {
        access_token: 'test_token',
      },
    },
  });

export const logout = async () => Promise.resolve(undefined);

export const getUser = () => ({
  data: {
    user: mockUser,
    token: {
      access_token: 'test_token',
    },
  },
});

export const storeUser = () => {};
