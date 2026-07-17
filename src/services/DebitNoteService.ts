import api from './api';
import { createBaseService } from './BaseService';
import { DebitNote, DebitNotePayload } from '@/types/DebitNote';

const baseService = createBaseService<DebitNote, DebitNotePayload>('debit-notes');

export const DebitNoteService = {
  ...baseService,

  async getNextDebitNoteNumber() {
    const response = await api.get('debit-notes/next-debit-note-number');
    return response.data;
  },
};

export default DebitNoteService;
