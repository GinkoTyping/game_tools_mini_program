// stores/userStore.js
import { defineStore } from 'pinia';

import { ITarot, queryDrawTarot, queryUserMarks } from '@/api/wow';

interface IUserState {
  tarot: ITarot;
  [key: string]: any;
}
export const useUserStore = defineStore('user', {
  state: (): IUserState => ({
    marks: {
      npcs: [],
      spells: [],
    },
    isFreeAd: false,
    tarotCount: {
      count: 0,
      totalCount: 0,
    },
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
  }),
  actions: {
    async updateUserMarks() {
      this.marks = await queryUserMarks();
    },
    async drawTarot() {
      const data = await queryDrawTarot();
      this.tarot = data.tarot;
      this.tarotCount.count = data.count ?? 0;
      this.tarotCount.totalCount = data.totalCount ?? 0;
    },
  },
  getters: {},
});
