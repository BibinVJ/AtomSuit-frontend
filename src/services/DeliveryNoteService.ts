import api from './api';
import { createBaseService } from './BaseService';
import { DeliveryNote, DeliveryNotePayload } from '@/types/DeliveryNote';

const baseService = createBaseService<DeliveryNote, DeliveryNotePayload>('delivery-notes');

export const DeliveryNoteService = {
  ...baseService,

  async getNextDeliveryNoteNumber() {
    const response = await api.get('delivery-notes/next-delivery-note-number');
    return response.data;
  },
};

export default DeliveryNoteService;
