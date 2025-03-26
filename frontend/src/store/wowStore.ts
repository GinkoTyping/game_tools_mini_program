// stores/userStore.js
import { defineStore } from 'pinia';

import {
  ICommonUserTagOptionItem,
  ICommonUserTagOptions,
  IDrawTarotInfo,
  ITagOptionItem,
  IWowUserTagOptions,
  queryCheckDrawTarot,
  queryDrawTarot,
  queryFriendOptions,
  queryUserMarks,
} from '@/api/wow';

interface IUserState {
  drawTarotInfo: IDrawTarotInfo;
  userTagOptions: {
    wowOptions: IWowUserTagOptions;
    commonOptions: ICommonUserTagOptions;
  };
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
    userTagOptions: {
      wowOptions: {
        jobs: {} as ITagOptionItem,
        classes: {} as ITagOptionItem,
        gameStyle: {} as ITagOptionItem,
        activeTime: {} as ITagOptionItem,
        communication: {} as ITagOptionItem,
      },
      commonOptions: {
        status: {} as ITagOptionItem,
        age: {} as ITagOptionItem,
        game: {} as ITagOptionItem,
        personality: {} as ITagOptionItem,
        role: {} as ITagOptionItem,
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
    async getFriendOptions() {
      this.userTagOptions = await queryFriendOptions();
    },
  },
  getters: {},
});
