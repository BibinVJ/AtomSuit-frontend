import { AccountType } from '../types';
import { createBaseService, QueryParams, PaginatedResponse } from './BaseService';

const accountTypeService = createBaseService<AccountType, Partial<AccountType>>('/account-types');

export const getAccountTypes = (
  params: QueryParams = {}
): Promise<PaginatedResponse<AccountType>> => accountTypeService.list(params);

// Account Types are read-only mostly, but service supports all if needed.
// Only list is primary requirement.

const AccountTypeService = {
  ...accountTypeService,
};

export default AccountTypeService;
