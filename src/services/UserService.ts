import { createBaseService, QueryParams, PaginatedResponse } from './BaseService';
import { User, UserInput, UserLoginDetail } from '@/types/User';

const userService = createBaseService<User, UserInput>('/users');

export const getUsers = userService.list;
export const addUser = userService.create;
export const updateUser = userService.update;
export const deleteUser = userService.delete;
export const restoreUser = (id: number) => userService.restore(id);

export const getUserLoginHistory = (
  params: QueryParams = {}
): Promise<PaginatedResponse<UserLoginDetail>> =>
  createBaseService<UserLoginDetail>('/user-login-details').list(params);

const UserService = {
  ...userService,
  restoreUser,
  getUserLoginHistory,
};

export default UserService;
