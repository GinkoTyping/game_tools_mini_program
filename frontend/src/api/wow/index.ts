import { IBisItem, ITrinks } from '@/interface/IWow';
import { mapBisItems, mapTrinks } from '@/data/mapSpecData';

// const BASE_URL = 'http://47.109.25.141:3000';
const BASE_URL = 'http://localhost:3000';

enum BisType {
  Overall = 0,
  Raid = 1,
  Mythic = 2,
}

interface IBisDataDTO {
  bis_trinkets: Array<ITrinks>;
  bis_items: Array<IBisItem>;
  bis_type: BisType;
  stats_priority: string;
  updated_at: string;
}

export async function queryBis(roleClass: string, classSpec: string) {
  const res = await uni.request({
    url: `${BASE_URL}/wow/bis/${roleClass}/${classSpec}`,
    method: 'GET',
  });
  const data = res.data as IBisDataDTO[];

  return {
    roleClass,
    classSpec,
    statsPriority: data[0].stats_priority,
    updatedAt: data[0].updated_at,
    trinkets: mapTrinks(data[0].bis_trinkets),
    overall: mapBisItems(
      data.find(item => item.bis_type === BisType.Overall)?.bis_items ?? []
    ),
    bisItemRaid: mapBisItems(
      data.find(item => item.bis_type === BisType.Raid)?.bis_items ?? []
    ),
    bisItemMythic: mapBisItems(
      data.find(item => item.bis_type === BisType.Mythic)?.bis_items ?? []
    ),
  };
}
