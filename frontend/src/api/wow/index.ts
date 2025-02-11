import { IBisItem, ITrinks, IStatPriority } from '@/interface/IWow';
import { mapBisItems, mapTrinks } from '@/data/mapSpecData';

// const BASE_URL = 'https://ginkolearn.cyou';
const BASE_URL = 'http://localhost:3000';

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
}

export async function queryBis(roleClass: string, classSpec: string) {
  const res = await uni.request({
    url: `${BASE_URL}/wow/bis/${roleClass}/${classSpec}`,
    method: 'GET',
  });
  const data = res.data as IBisDataDTO;

  return {
    roleClass,
    classSpec,
    statsPriority: data.stats_priority,
    updatedAt: data.updated_at,
    trinkets: mapTrinks(data.bis_trinkets),
    bisItems: data.bis_items,
  };
}

export async function queryItemPreview(id: number) {
  try {
    const res: any = await uni.request({
      url: `${BASE_URL}/wow/item/${id}`,
    });
    if (res.data?.preview_item.stats) {
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

    return res.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export interface IDungeonDTO {
  id: number;
  name_zh: string;
  name_en: string;
}
export async function querySeaonDungeons() {
  try {
    const res = await uni.request({
      url: `${BASE_URL}/wow/dungeon/list`,
    });
    return res.data as IDungeonDTO[];
  } catch (error) {
    return [];
  }
}
