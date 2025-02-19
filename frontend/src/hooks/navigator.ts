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

export function useNavigator() {
  return { toSpecDetail, toSpecsMenu };
}
