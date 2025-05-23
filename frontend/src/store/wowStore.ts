// stores/userStore.js
import { defineStore } from 'pinia';

import {
  ICommonUserTagOptions,
  IDrawTarotInfo,
  ISpecTagOption,
  ITagOptionItem,
  IWowUserTagOptions,
  queryCheckDrawTarot,
  queryDrawTarot,
  queryFriendOptions,
  queryNotViewedRelation,
  queryUserMarks,
} from '@/api/wow';

interface IUserState {
  drawTarotInfo: IDrawTarotInfo;
  userTagOptions: {
    wowOptions: IWowUserTagOptions;
    commonOptions: ICommonUserTagOptions;
    specs: ISpecTagOption[];
  };
  notification: {
    fillCommonUserTag: boolean;
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
        server: {} as ITagOptionItem,
        jobs: {} as ITagOptionItem,
        spec: {} as ITagOptionItem,
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
      specs: [] as ISpecTagOption[],
    },
    notification: {
      fillCommonUserTag: false,
    },
    notViewedRelations: {},
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

    async getNotViewedRelations() {
      this.notViewedRelations = await queryNotViewedRelation();
    },
  },
  getters: {
    unreadTagRelationCount(state) {
      return state.notViewedRelations?.count ?? 0;
    },
  },
});
