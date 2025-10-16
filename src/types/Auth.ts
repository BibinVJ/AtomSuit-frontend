import { User } from './User';

export interface AuthContextType {
  user: User | null;
  login: (
    identifier: string,
    password: string,
    stayLoggedIn: boolean
  ) => Promise<User>;
  logout: () => void;
  loading: boolean;
  fetchProfile: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
}
export interface LoginResponse {
  data: {
    user: User;
    token: {
      access_token: string;
    };
  };
}
