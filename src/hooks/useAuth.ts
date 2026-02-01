import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { AuthContextType } from '@/types';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return safe defaults when used outside provider (e.g., during SSR)
    return {
      user: null,
      login: async () => {
        throw new Error('AuthProvider not available');
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          console.warn('useAuth called outside of AuthProvider');
        }
      },
      loading: false,
      fetchProfile: async () => false,
      hasPermission: () => false,
    };
  }
  return context;
};
