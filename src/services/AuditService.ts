import api from './api';
import { AuditEntry } from '../types';

export const AuditService = {
  getActivities: (params?: {
    page?: number;
    limit?: number;
    from?: number;
    to?: number;
    sort_by?: string;
    sort_direction?: string;
    search?: string;
    event?: string;
    subject_type?: string;
  }) => api.get('/audit', { params }).then((res) => res.data),

  getActivity: (id: string | number): Promise<{ data: AuditEntry }> =>
    api.get(`/audit/${id}`).then((res) => res.data),
};

export default AuditService;
