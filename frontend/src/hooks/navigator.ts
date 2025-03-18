import labels from '@/data/zh.json';
import { ILocaleLabels } from '@/interface/ILocaleLabels';

const localeLabels = labels as ILocaleLabels;
// 专精攻略
function toSpecDetail(classKey: string, specKey: string) {
  uni.navigateTo({
    url: `/pages/bis/index?classKey=${classKey}&specKey=${specKey}&title=${localeLabels[classKey][specKey]}${localeLabels.class[classKey]}`,
  });
}

// 专精列表
function toSpecsMenu() {
  uni.navigateTo({
    url: '/pages/spec-list/index',
  });
}

// 更新日志
function toPatchLog() {
  uni.navigateTo({
    url: '/pages/patch-log/index',
  });
}

// 专精排行
function toTierList(params: {
  version_id: string;
  activity_type: string;
  role: string;
}) {
  const { version_id, activity_type, role } = params;
  uni.navigateTo({
    url: `/pages/tier-list/index?versionId=${version_id}&activityType=${activity_type}&role=${role}`,
  });
}

// 大秘境列表
function toMythicDungeonList() {
  uni.navigateTo({
    url: `/pages/mythic-dungeon/list`,
  });
}

// 大秘境攻略
function toMythicDungeon(id: number, type?: string, guideId?: number) {
  uni.navigateTo({
    url: `/pages/mythic-dungeon/index?id=${id}&type=${type}&guideId=${guideId}`,
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
    url: `/pages/raid-guide/index`,
  });
}

// 大秘境问卷
function toQuestionDungeon(dungeonId, isRetry?: boolean) {
  uni.navigateTo({
    url: `/pages/question/each?dungeonId=${dungeonId}&isRetry=${isRetry}`,
  });
}

// 大秘境问卷结果
function toQuestionResult(dungeonId) {
  uni.navigateTo({
    url: `/pages/question/result?dungeonId=${dungeonId}`,
  });
}

// 大秘境问卷首页
function toQuestionIndex() {
  uni.navigateTo({
    url: `/pages/question/index`,
  });
}

function toPage(page: string) {
  uni.navigateTo({
    url: page,
  });
}

export function useNavigator() {
  return {
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
  };
}
