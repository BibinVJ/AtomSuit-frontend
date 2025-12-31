import { createBaseService } from './BaseService';
import { AuditEntry } from '../types';

const baseService = createBaseService<AuditEntry, unknown>('/audit');

export const getActivities = baseService.list;
export const getActivity = baseService.get;

const AuditService = {
  getActivities,
  getActivity,
};

export default AuditService;
