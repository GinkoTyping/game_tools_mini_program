import labels from '@/data/zh.json';
import { ILocaleLabels } from '@/interface/ILocaleLabels';

const localeLabels = labels as ILocaleLabels;
function toSpecDetail(classKey: string, specKey: string) {
  uni.navigateTo({
    url: `/pages/bis/index?classKey=${classKey}&specKey=${specKey}&title=${localeLabels[classKey][specKey]}${localeLabels.class[classKey]}`,
  });
}

function toSpecsMenu() {
  uni.navigateTo({
    url: '/pages/index/index',
  });
}

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

export function useNavigator() {
  return { toSpecDetail, toSpecsMenu, toTierList };
}
