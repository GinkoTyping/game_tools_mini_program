// stores/userStore.js
import { defineStore } from 'pinia';

import {
  IDrawTarotInfo,
  queryCheckDrawTarot,
  queryDrawTarot,
  queryUserMarks,
} from '@/api/wow';

interface IUserState {
  drawTarotInfo: IDrawTarotInfo;
  [key: string]: any;
}
export const useUserStore = defineStore('user', {
  state: (): IUserState => ({
    marks: {
      npcs: [],
      spells: [],
    },
    isFreeAd: false,
    drawTarotInfo: {
      hasDraw: false,
      count: 0,
      totalCount: 0,
      drawCardId: -1,
      tarot: {
        id: -1,
        isPositive: false,
        name: '',
        name_en: '',
        negative_suggestion: '',
        negative_summary: '',
        positive_suggestion: '',
        positive_summary: '',
      },
    },
  }),
  actions: {
    async updateUserMarks() {
      this.marks = await queryUserMarks();
    },
    async checkDrawTarot() {
      this.drawTarotInfo = await queryCheckDrawTarot();
    },
    async drawTarot() {
      this.drawTarotInfo = await queryDrawTarot();
    },
  },
  getters: {},
});
