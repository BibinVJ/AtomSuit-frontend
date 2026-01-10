import { createBaseService } from './BaseService';
import { User, UserInput } from '../types';

const baseService = createBaseService<User, UserInput>('/users');

export const getUsers = baseService.list;
export const addUser = baseService.create;
export const updateUser = baseService.update;
export const deleteUser = baseService.delete;
export const restoreUser = baseService.restore;

const UserService = {
  ...baseService,
};

export default UserService;
