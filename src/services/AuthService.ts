import api from "./api";
import { LoginResponse } from "../types";

export const login = async (identifier: string, password: string): Promise<LoginResponse> => {
  const formData = new FormData();
  formData.append("identifier", identifier);
  formData.append("password", password);

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
  } catch (error) {
    console.error("Logout failed on server:", error);
  } finally {
    // Always clear local data
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    // Remove the authorization header
    delete api.defaults.headers.common["Authorization"];
  }
};

export const storeUser = (user: LoginResponse, persistent = false) => {
  const userString = JSON.stringify(user);
  if (persistent) {
    localStorage.setItem("user", userString);
  } else {
    sessionStorage.setItem("user", userString);
  }
};

export const getUser = () => {
  const userString = sessionStorage.getItem("user") || localStorage.getItem("user");
  if (userString) {
    return JSON.parse(userString);
  }
  return null;
};
