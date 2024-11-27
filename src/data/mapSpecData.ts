// TODO 迁移至插件内处理？
import rawData from '@/data/spec-data.json';
import { IWowBIS, IBisItem } from '@/interface/IWow';

function getSlotLabel(key: string) {
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
    ring: '戒指',
    ['ring 1']: '戒指',
    ['ring 2']: '戒指',
    trinket: '饰品',
    ['trinket 1']: '饰品',
    ['trinket 2']: '饰品',
    ['alt (aoe)']: '饰品',
    ['alt (single)']: '饰品',
    weapon: '武器',
    ['main hand']: '主手',
    ['off hand']: '副手',
  };

  return locales[key.toLowerCase() as any];
}

function getSourceLabel(source: string) {
  if (!source) {
    return source;
  }
  if (['crafting'].includes(source.toLowerCase())) {
    return '制造装备';
  }

  const output = source.replace(/[a-zA-Z\s|\/]/g, '');

  if (output.length) {
    return output;
  } else if (source.toLowerCase().includes('catalyst')) {
    return '职业套装';
  }

  return output;
}

function mapBisItems(items: IBisItem[]) {
  return items.reduce((pre: IBisItem[], cur: IBisItem) => {
    if (cur.item && cur.slot !== 'Slot') {
      pre.push({
        ...cur,
        slot: getSlotLabel(cur.slot),
        source: getSourceLabel(cur.source),
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
