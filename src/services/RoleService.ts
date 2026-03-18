import { createBaseService } from './BaseService';
import { Role } from '@/types';

const baseService = createBaseService<Role, unknown>('/roles');

export const getRoles = baseService.list;
export const getRole = baseService.get;
export const addRole = baseService.create;
export const updateRole = baseService.update;
export const deleteRole = baseService.delete;
export const restoreRole = baseService.restore;

const RoleService = {
  ...baseService,
  addRole,
};

export default RoleService;
