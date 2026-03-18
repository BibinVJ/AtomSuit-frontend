import { ChartOfAccount, ChartOfAccountInput } from '@/types';
import { createBaseService, QueryParams, PaginatedResponse } from './BaseService';

const chartOfAccountService = createBaseService<ChartOfAccount, ChartOfAccountInput>(
  '/chart-of-accounts'
);

export const getChartOfAccounts = (
  params: QueryParams = {}
): Promise<PaginatedResponse<ChartOfAccount>> => chartOfAccountService.list(params);

export const getChartOfAccount = (id: number): Promise<ChartOfAccount> =>
  chartOfAccountService.get(id);

export const addChartOfAccount = (data: ChartOfAccountInput) => chartOfAccountService.create(data);

export const updateChartOfAccount = (id: number, data: ChartOfAccountInput) =>
  chartOfAccountService.update(id, data);

export const deleteChartOfAccount = (id: number, force: boolean = false) =>
  chartOfAccountService.delete(id, force);

export const restoreChartOfAccount = (id: number) => chartOfAccountService.restore(id);

export const exportChartOfAccounts = () =>
  chartOfAccountService.export('/chart-of-accounts/export/excel');

export const importChartOfAccounts = (file: File) => {
  return chartOfAccountService.import(file, '/chart-of-accounts/import');
};

const ChartOfAccountService = {
  ...chartOfAccountService,
};

export default ChartOfAccountService;
