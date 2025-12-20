import { getUser } from '../services/AuthService';

/**
 * Check if user has a valid authentication token
 */
export const isAuthenticated = (): boolean => {
  const user = getUser();
  return !!(user && user.data && user.data.token && user.data.token.access_token);
};

/**
 * Get the current authentication token
 */
export const getAuthToken = (): string | null => {
  // Check both localStorage and sessionStorage
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  if (token) {
    return token;
  }

  // Fallback to user object if token is stored there
  const user = getUser();
  if (user && user.data && user.data.token && user.data.token.access_token) {
    return user.data.token.access_token;
  }

  return null;
};

/**
 * Check if current route should be public (no authentication required)
 */
export const isPublicRoute = (pathname: string): boolean => {
  const publicRoutes = ['/', '/signin', '/signup', '/forgot-password', '/reset-password'];

  return publicRoutes.includes(pathname) || pathname.startsWith('/auth');
};

/**
 * Check if current route requires authentication
 */
export const isProtectedRoute = (pathname: string): boolean => {
  return !isPublicRoute(pathname);
};

/**
 * Clear all authentication data
 */
export const clearAuthData = (): void => {
  // Clear localStorage
  localStorage.removeItem('user');
  localStorage.removeItem('token');

  // Clear sessionStorage
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('token');
};
