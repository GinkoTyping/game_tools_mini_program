// stores/userStore.js
import { defineStore } from 'pinia';

import { queryUserMarks } from '@/api/wow';

export const useUserStore = defineStore('user', {
  state: () => ({
    marks: {
      npcs: [],
      spells: [],
    },
  }),
  actions: {
    async updateUserMarks(userId: number) {
      if (userId) {
        this.marks = await queryUserMarks(userId);
      }
    },
  },
  getters: {},
});
