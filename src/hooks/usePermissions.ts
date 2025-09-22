import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { hasPermission } = useAuth();
  return { hasPermission };
};
