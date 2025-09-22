import api from "./api";

export const getDashboardData = async () => {
  return api.get(`/dashboard`);
};
