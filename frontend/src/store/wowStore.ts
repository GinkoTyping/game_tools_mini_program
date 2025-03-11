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
    async updateUserMarks() {
      this.marks = await queryUserMarks();
    },
  },
  getters: {},
});
