import { createBaseService } from './BaseService';
import { AuditEntry } from '@/types';

const baseService = createBaseService<AuditEntry, unknown>('/audits');

export const getActivities = baseService.list;
export const getActivity = baseService.get;

const AuditService = {
  getActivities,
  getActivity,
};

export default AuditService;
