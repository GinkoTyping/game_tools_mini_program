import labels from '@/data/zh.json';
import type { ILocaleLabels } from '@/interface/ILocaleLabels';

const localeLabels = labels as ILocaleLabels;

// 主页
function toHome() {
  uni.reLaunch({
    url: `/pages/index/index`,
  });
}

// 专精攻略
function toSpecDetail(
  classKey: string,
  specKey: string,
  menu: string = '',
  scrollTo: string = '',
) {
  uni.navigateTo({
    url: `/pages/bis/index?classKey=${classKey}&specKey=${specKey}&title=${localeLabels[classKey][specKey]}${localeLabels.class[classKey]}&menu=${menu}&scrollTo=${scrollTo}`,
  });
}

// 专精列表
function toSpecsMenu(params) {
  if (params.menu && params.scrollTo) {
    uni.navigateTo({
      url: `/pages/spec-list/index?menu=${params.menu}&scrollTo=${params.scrollTo}`,
    });
  } else {
    uni.navigateTo({
      url: `/pages/spec-list/index`,
    });
  }
}

// 更新日志
function toPatchLog() {
  uni.navigateTo({
    url: '/pages-sub-wow/patch-log/index',
  });
}

// 专精排行
function toTierList(
  params: {
    version_id: string;
    activity_type: string;
    role: string;
  },
  isRedirect?: boolean,
) {
  const { version_id, activity_type, role } = params;
  const url = `/pages/tier-list/index?versionId=${version_id}&activityType=${activity_type}&role=${role}`;
  if (isRedirect) {
    uni.redirectTo({
      url,
    });
  } else {
    uni.navigateTo({
      url,
    });
  }
}

// 大秘境列表
function toMythicDungeonList() {
  uni.navigateTo({
    url: `/pages-sub-wow/mythic-dungeon/list`,
  });
}

// 大秘境攻略
function toMythicDungeon(id: number, type?: string, guideId?: number) {
  uni.navigateTo({
    url: `/pages-sub-wow/mythic-dungeon/index?id=${id}&type=${type}&guideId=${guideId}`,
  });
}

// 专精数据
function toSpecPopularity() {
  uni.navigateTo({
    url: `/pages/spec-popularity/index`,
  });
}

// 团本攻略
function toRaidGuide() {
  uni.navigateTo({
    url: `/pages-sub-wow/raid-guide/index`,
  });
}

// 大秘境问卷
function toQuestionDungeon(dungeonId, isRetry: boolean = false) {
  uni.navigateTo({
    url: `/pages-sub-wow/question/each?dungeonId=${dungeonId}&isRetry=${isRetry}`,
  });
}

// 大秘境问卷结果
function toQuestionResult(dungeonId) {
  uni.navigateTo({
    url: `/pages-sub-wow/question/result?dungeonId=${dungeonId}`,
  });
}

// 大秘境问卷首页
function toQuestionIndex() {
  uni.navigateTo({
    url: `/pages-sub-wow/question/index`,
  });
}

// 艾泽拉斯同好会 首页
function toFrindIndex() {
  uni.navigateTo({
    url: `/pages-sub-wow/friend/index`,
  });
}

// 艾泽拉斯同好会 个人设置
function toFrindSetting() {
  uni.navigateTo({
    url: `/pages-sub-wow/friend/setting`,
  });
}

// 塔罗牌
function toDivinationResult(tarotId: number = -1) {
  uni.navigateTo({
    url: `/pages-sub-wow/divination/result?tarotId=${tarotId}`,
  });
}

function toDivinationIndex() {
  uni.navigateTo({
    url: `/pages-sub-wow/divination/index`,
  });
}

function toPage(page: string) {
  uni.navigateTo({
    url: page,
  });
}

function redirectToPage(page: string) {
  uni.redirectTo({
    url: page,
  });
}

// POE 天梯
function redirectToPoeLadders() {
  uni.redirectTo({
    url: `/pages-poe/ladders/index`,
  });
}

function toPoeDeatilLadder(type: string, name: string) {
  uni.navigateTo({
    url: `/pages-poe/ladders/detail?type=${type}&name=${name}`,
  });
}

export function useNavigator() {
  return {
    toHome,
    toSpecDetail,
    toSpecsMenu,
    toTierList,
    toPatchLog,
    toMythicDungeon,
    toMythicDungeonList,
    toSpecPopularity,
    toPage,
    toRaidGuide,
    toQuestionDungeon,
    toQuestionResult,
    toQuestionIndex,
    toDivinationIndex,
    toDivinationResult,

    toFrindIndex,
    toFrindSetting,
    redirectToPage,

    // POE
    redirectToPoeLadders,
    toPoeDeatilLadder,
  };
}
