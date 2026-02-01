import { AccountGroup, AccountGroupInput } from '@/types';
import { createBaseService, QueryParams, PaginatedResponse } from './BaseService';

const accountGroupService = createBaseService<AccountGroup, AccountGroupInput>('/account-groups');

export const getAccountGroups = (
  params: QueryParams = {}
): Promise<PaginatedResponse<AccountGroup>> => accountGroupService.list(params);

export const getAccountGroup = (id: number): Promise<AccountGroup> => accountGroupService.get(id);

export const addAccountGroup = (data: AccountGroupInput) => accountGroupService.create(data);

export const updateAccountGroup = (id: number, data: AccountGroupInput) =>
  accountGroupService.update(id, data);

export const deleteAccountGroup = (id: number, force: boolean = false) =>
  accountGroupService.delete(id, force);

export const restoreAccountGroup = (id: number) => accountGroupService.restore(id);

export const exportAccountGroups = () => accountGroupService.export('/account-groups/export/excel');

export const importAccountGroups = (file: File) => {
  return accountGroupService.import(file, '/account-groups/import');
};

const AccountGroupService = {
  ...accountGroupService,
};

export default AccountGroupService;
