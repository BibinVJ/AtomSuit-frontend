import { createBaseService } from './BaseService';
import { Domain } from '@/types';

const baseService = createBaseService<Domain, unknown>('/domains');

export const getDomains = baseService.list;

const DomainService = {
  getDomains,
};

export default DomainService;
