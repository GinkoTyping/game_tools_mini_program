// TODO 迁移至插件内处理？
import rawData from '@/data/spec-data.json';
import { IWowBIS, IBisItem } from '@/interface/IWow';

function getSlotLabel(key: string) {
  const lowerCaseKey = key.toLowerCase();
  type Locale = {
    [key: string]: string;
  };
  const locales: Locale = {
    head: '头部',
    neck: '颈部',
    shoulders: '肩部',
    cloak: '项链',
    chest: '胸甲',
    wrist: '手腕',
    gloves: '手套',
    belt: '腰带',
    legs: '腿部',
    boots: '脚部',
    ['alt (aoe)']: '饰品',
    ['alt (single)']: '饰品',
    weapon: '武器',
    ['main hand']: '主手',
    ['off hand']: '副手',
  };

  if (locales[lowerCaseKey]?.length) {
    return locales[lowerCaseKey];
  }

  if (lowerCaseKey.includes('trinket')) {
    return '饰品';
  }

  if (lowerCaseKey.includes('ring')) {
    return '戒指';
  }

  return '';
}

function getSourceLabel(source: string) {
  if (!source) {
    return { source: '/', isLoot: false };
  }
  if (
    ['crafting', 'leatherworking', 'blacksmithing'].includes(
      source.toLowerCase()
    )
  ) {
    return { source: '制造装备', isLoot: false };
  }
  
  if (source.toLowerCase().includes('catalyst')) {
    return { source: '职业套装', isLoot: false };
  }

  const output = source.replace(/[a-zA-Z\s|\/\(\)尼鲁巴尔王宫]/g, '');
  return { source: output.replace(',,', ''), isLoot: true };
}

function isTrink(item: IBisItem) {
  const lowerCaseSource = item.slot?.toLowerCase();
  if (!lowerCaseSource) {
    return false;
  }
  if (
    lowerCaseSource.includes('trinket') ||
    lowerCaseSource.includes('single') ||
    lowerCaseSource.includes('aoe')
  ) {
    return true;
  }
  return false;
}

function mapBisItems(items: IBisItem[]) {
  return items.reduce((pre: IBisItem[], cur: IBisItem) => {
    // 饰品有单独的栏位展示
    if (cur.item && cur.slot !== 'Slot' && !isTrink(cur)) {
      const { source, isLoot } = getSourceLabel(cur.source);
;      pre.push({
        ...cur,
        slot: getSlotLabel(cur.slot),
        wrap: false,
        source,
        isLoot,
      });
    }
    return pre;
  }, []);
}

export function mapSpecData() {
  const data = JSON.parse(JSON.stringify(rawData)) as IWowBIS;
  Object.entries(data).forEach((item, index) => {
    let [key, value] = item;
    value = value.map(specItem => ({
      ...specItem,
      overall: mapBisItems(specItem.overall),
      bisItemRaid: mapBisItems(specItem.bisItemRaid),
      bisItemMythic: mapBisItems(specItem.bisItemMythic),
    }));

    data[key] = value;
  });
  return data;
}
