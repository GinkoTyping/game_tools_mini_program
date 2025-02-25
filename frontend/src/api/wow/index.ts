import { IBisItem, ITrinks, IStatPriority } from '@/interface/IWow';
import { mapTrinks } from '@/data/mapSpecData';
import { BASE_URL } from '../config';

enum BisType {
  Overall = 0,
  Raid = 1,
  Mythic = 2,
}

interface IBisDataDTO {
  bis_trinkets: Array<ITrinks>;
  bis_items: { items: Array<IBisItem>; title: string }[];
  bis_type: BisType;
  stats_priority: IStatPriority[];
  updated_at: string;
  comment: string;
  ratings: { label: string; rating: number }[];
  version: string;
}

export async function queryBis(roleClass: string, classSpec: string) {
  const res = await uni.request({
    url: `${BASE_URL}/wow/bis/${roleClass}/${classSpec}`,
    method: 'GET',
  });
  const data = res.data as IBisDataDTO;

  function mapRatings(rating: number) {
    let count = rating;
    let index = 0;
    const array = new Array(5).fill(0);
    while (count > 0) {
      array[index] = 1;
      count--;
      index++;
    }
    return array;
  }

  function mapRatingComment(label: string, score: number) {
    switch (score) {
      case 5:
        if (['单体', 'AOE'].includes(label)) {
          return '暴力';
        } else if (label === '功能性') {
          return '顶级工具人';
        } else if (label === '移动性') {
          return '大长腿';
        } else if (label === '生存能力') {
          return '体育生';
        }
        return '出色';
      case 4:
        if (label === '移动性') {
          return '小长腿';
        } else if (label === '生存能力') {
          return '健壮';
        }
        return '强力';
      case 3:
      case 2:
        if (label === '移动性') {
          return '摇轮椅';
        } else if (label === '生存能力') {
          return '脆皮儿';
        }
        return '还行';
      case 1:
        if (label === '移动性') {
          return '蠕动';
        }
        return '路边一条';

      default:
        break;
    }
  }

  // 个别装备栏位的介绍 仍然为英语
  function mapBisItem(data: IBisDataDTO) {
    data.bis_items.forEach(
      (bisType: { items: Array<IBisItem>; title: string }) => {
        bisType.items = bisType.items.map(item => {
          if (item.slot.toLowerCase().includes('weapon')) {
            item.slot = '武器';
          }
          return item;
        });
      }
    );
    return data.bis_items;
  }

  return {
    roleClass,
    classSpec,
    statsPriority: data.stats_priority,
    updatedAt: data.updated_at,
    trinkets: mapTrinks(data.bis_trinkets),
    bisItems: mapBisItem(data),
    ratings: data.ratings.map(item => ({
      label: item.label,
      comment: mapRatingComment(item.label, item.rating),
      ratingScore: item.rating,
      rating: mapRatings(item.rating),
    })),
    version: data.version,
  };
}

export async function queryItemPreview(id: number) {
  try {
    const res: any = await uni.request({
      url: `${BASE_URL}/wow/item/${id}`,
    });
    if (res.data?.preview_item?.stats) {
      res.data.preview_item.stats = res.data.preview_item.stats.reduce(
        (pre: any, cur: any) => {
          if (cur.is_equip_bonus || !cur.is_negated) {
            pre.push(cur);
          } else if (cur.is_negated) {
            const negated = pre.find((item: any) => !item.is_equip_bonus);
            if (negated) {
              negated.display.display_string += ` 或 ${cur.type.name}`;
            } else {
              pre.push(cur);
            }
          }

          return pre;
        },
        []
      );
    }

    return { data: res.data, statusCode: res.statusCode };
  } catch (error) {
    console.log({ error });
    return { data: null, statusCode: error };
  }
}

export interface IDungeonDTO {
  id: number;
  name_zh: string;
  name_en: string;
}
export async function querySeasonDungeons() {
  try {
    const res = await uni.request({
      url: `${BASE_URL}/wow/dungeon/list`,
    });
    return res.data as IDungeonDTO[];
  } catch (error) {
    return [];
  }
}

export async function queryDungeonTip(params: {
  roleClass: string;
  classSpec: string;
  dungeonId: number;
}) {
  const { roleClass, classSpec, dungeonId } = params;
  try {
    const res: any = await uni.request({
      url: `${BASE_URL}/wow/dungeon-tip`,
      method: 'POST',
      data: {
        roleClass,
        classSpec,
        dungeonId,
      },
    });
    return JSON.parse(res.data.tips);
  } catch (error) {}
}

export async function querySpellsInTip(ids: number[]) {
  try {
    const res: any = await uni.request({
      url: `${BASE_URL}/wow/spell`,
      method: 'POST',
      data: {
        ids,
      },
    });

    return res.data?.map((spell: any) => {
      return {
        ...spell,
        range: spell.range === -1 ? '' : spell.range,
        cost: spell.cost?.replaceAll(' 值', ''),
        description: spell.description?.replaceAll(' sec', '秒'),
      };
    });
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function queryTrend() {
  try {
    const res: any = await uni.request({
      url: `${BASE_URL}/wow/bis/trend`,
    });
    if (res.data?.trend?.[0]?.access_count > 0) {
      res.data.trend.forEach((item: any, index: number) => {
        if (index === 0) {
          item.fires = new Array(3).fill(1);
        } else if (index <= 3) {
          item.fires = new Array(2).fill(1);
        } else if (index <= 6) {
          item.fires = new Array(1).fill(1);
        } else {
          item.fires = [];
        }
      });
    }
    return res.data;
  } catch (error) {
    return [];
  }
}

export interface IHomeViewDTO {
  carousels: { role_class: string; class_spec: string; access_count: number }[];
  hotTopics: { role_class: string; class_spec: string; access_count: number }[];
  tierLists: { version_id: string; role: string; activity_type: string }[];
}
export async function queryHomeView() {
  try {
    const res: any = await uni.request({ url: `${BASE_URL}/wow/home-view` });
    res.data.tierLists = res.data.tierLists.map((item: any) => {
      if (item.activity_type === 'MYTHIC') {
        item.activity_name = '大秘境';
      }
      return item;
    });
    return res.data as IHomeViewDTO;
  } catch (error) {
    return {} as IHomeViewDTO;
  }
}

export interface ITierListDTO {
  activity_type: string;
  role: string;
  version_id: string;
  created_at: string;
  tier_data: ITierDataItem[];
}
interface ITierDataItem {
  tier: string;
  children: ITierSpecDetail[];
}
export interface ITierSpecDetail {
  dataChange: string;
  classSpec: string;
  roleClass: string;
  desc: string;
  descZH: string;
  fullNameEN: string;
  fullNameZH: string;
  spells: { spellId: number }[];
}
export async function queryTierList(params: {
  versionId: string;
  role: string;
  activityType: string;
}) {
  try {
    const { versionId, role, activityType } = params;

    const res: any = await uni.request({
      url: `${BASE_URL}/wow/tier-list`,
      method: 'POST',
      data: {
        versionId,
        role: role?.toUpperCase(),
        activityType: activityType?.toUpperCase(),
      },
    });
    if (res.data) {
      res.data.created_at = res.data.created_at.slice(0, 10);
    }
    return res.data as ITierListDTO;
  } catch (error) {
    return {} as ITierListDTO;
  }
}
