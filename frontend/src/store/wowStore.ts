// stores/userStore.js
import { defineStore } from 'pinia';

import {
  ICommonUserTagOptionItem,
  ICommonUserTagOptions,
  IDrawTarotInfo,
  IWowTagOptionItem,
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
        jobs: {} as IWowTagOptionItem,
        classes: {} as IWowTagOptionItem,
        gameStyle: {} as IWowTagOptionItem,
        activeTime: {} as IWowTagOptionItem,
        communication: {} as IWowTagOptionItem,
      },
      commonOptions: {
        status: {} as ICommonUserTagOptionItem,
        age: {} as ICommonUserTagOptionItem,
        game: {} as ICommonUserTagOptionItem,
        personality: {} as ICommonUserTagOptionItem,
        role: {} as ICommonUserTagOptionItem,
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
