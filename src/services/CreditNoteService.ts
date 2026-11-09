import api from './api';
import { createBaseService } from './BaseService';
import { CreditNote, CreditNotePayload } from '@/types/CreditNote';

const baseService = createBaseService<CreditNote, CreditNotePayload>('credit-notes');

export const CreditNoteService = {
  ...baseService,

  async getNextCreditNoteNumber() {
    const response = await api.get('credit-notes/next-credit-note-number');
    return response.data;
  },
};

export default CreditNoteService;
