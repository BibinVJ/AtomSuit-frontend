import api from './api';
import { LoginResponse } from '@/types';

export const login = async (identifier: string, password: string): Promise<LoginResponse> => {
  const formData = new FormData();
  formData.append('identifier', identifier);
  formData.append('password', password);

  const response = await api.post('/login', formData);
  return response.data;
};

export const logout = async () => {
  // Notify the server about logout
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      await api.post('/logout');
    }
  } catch {
    // Silently handle logout errors
  } finally {
    // Always clear local data
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    // Remove the authorization header
    delete api.defaults.headers.common['Authorization'];
  }
};

export const storeUser = (user: LoginResponse, persistent = false) => {
  const userString = JSON.stringify(user);
  const token = user.data.token.access_token;

  if (persistent) {
    localStorage.setItem('user', userString);
    localStorage.setItem('token', token);
  } else {
    sessionStorage.setItem('user', userString);
    sessionStorage.setItem('token', token);
  }
};

export const getUser = () => {
  const userString = sessionStorage.getItem('user') || localStorage.getItem('user');
  if (userString) {
    return JSON.parse(userString);
  }
  return null;
};
export const sendResetOtp = async (identifier: string) => {
  const response = await api.post('/auth/send-reset-otp', { identifier });
  return response.data;
};

export const verifyOtp = async (identifier: string, otp: string) => {
  const response = await api.post('/auth/verify-otp', { identifier, otp });
  return response.data;
};

export const resetPassword = async (data: Record<string, string>) => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};

// Use existing resetPassword for authenticated change as well
export const changePassword = async (data: Record<string, string>) => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};

// Use existing sendResetOtp for authenticated change as well
export const sendChangePasswordOtp = async (identifier: string) => {
  const response = await api.post('/auth/send-reset-otp', { identifier });
  return response.data;
};
