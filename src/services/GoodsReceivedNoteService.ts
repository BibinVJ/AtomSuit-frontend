import api from './api';
import { createBaseService } from './BaseService';
import { GoodsReceivedNote, GoodsReceivedNotePayload } from '@/types/GoodsReceivedNote';

const baseService = createBaseService<GoodsReceivedNote, GoodsReceivedNotePayload>(
  'goods-received-notes'
);

export const GoodsReceivedNoteService = {
  ...baseService,

  async getNextGrnNumber() {
    const response = await api.get('goods-received-notes/next-grn-number');
    return response.data;
  },
};

export default GoodsReceivedNoteService;
