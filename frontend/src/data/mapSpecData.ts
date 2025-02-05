// TODO 迁移至插件内处理？
import rawData from '@/data/spec-data.json';
import { IWowBIS, IBisItem, ITrinks } from '@/interface/IWow';

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
    offhand: '副手',
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
    ['crafting', 'leatherworking', 'blacksmithing', 'crafted'].includes(
      source.toLowerCase()
    )
  ) {
    return { source: '制造装备', isLoot: false };
  }

  if (source.toLowerCase().includes('catalyst')) {
    return { source: '职业套装', isLoot: false };
  }

  if (source.toLowerCase().includes('trash')) {
    return { source: '团本小怪', isLoot: false };
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
    lowerCaseSource.includes('staff') ||
    lowerCaseSource.includes('single') ||
    lowerCaseSource.includes('aoe')
  ) {
    return true;
  }
  return false;
}

export function mapBisItems(items: IBisItem[]) {
  return items.reduce((pre: IBisItem[], cur: IBisItem) => {
    // 饰品有单独的栏位展示
    if ((cur.item || cur.name) && cur.slot !== 'Slot' && !isTrink(cur)) {
      const { source, isLoot } = getSourceLabel(cur.source);
      pre.push({
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

export function mapTrinks(list: ITrinks[]) {
  return list.reduce((pre: ITrinks[], cur: ITrinks) => {
    if (pre.length >= 4 || !cur.trinkets?.length) {
      return pre;
    }

    cur.label = cur.label.replace('\n', '');
    cur.trinkets = cur.trinkets
      .map(url => getImageFileName(url))
      .filter(url => url?.length);
    pre.push(cur);
    return pre;
  }, []);
}

function getImageFileName(url: string) {
  const regex = /url\("([^"]*)"\)/;
  const path = url.match(regex)?.[1];
  if (path?.length) {
    return path.split('/').pop() ?? '';
  }
  return '';
}

function getTrinketURLs(data: IWowBIS) {
  const rawData = JSON.parse(JSON.stringify(data)) as IWowBIS;
  return Object.values(rawData).reduce((pre: Array<any>, cur) => {
    cur.forEach(specItem => {
      specItem.trinkets.forEach(tier => {
        const regex = /url\("([^"]*)"\)/;
        tier.trinkets.forEach(url => {
          if (url.length) {
            const matched = url.match(regex)?.[1];
            if (!pre.includes(matched)) {
              pre.push(matched);
            }
          }
        });
      });
    });
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
      trinkets: mapTrinks(specItem.trinkets),
    }));

    data[key] = value;
  });
  return data;
}
