import { Subscription } from '@/types';
import { createBaseService } from './BaseService';

const baseService = createBaseService<Subscription, unknown>('/subscriptions');

export const getSubscriptions = baseService.list;
export const getSubscription = baseService.get;
export const cancelSubscription = baseService.delete;

const SubscriptionService = {
  getSubscriptions,
  getSubscription,
  cancelSubscription,
};

export default SubscriptionService;
