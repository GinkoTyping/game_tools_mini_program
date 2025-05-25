import type { IBisItem, ITrinks, IStatPriority } from '@/interface/IWow';
import { mapTrinks } from '@/data/mapSpecData';
import { proxyRequest } from '../config';
import colorMap from '@/utils/color-map';
import localeName from '@/data/zh.json';
import { useAuth } from '@/hooks/auth';
import type { ICommonTag, IRelationItem, IWowTag } from '@/interface/IUserTag';

const localeNameMap: any = localeName;
const auth = useAuth();

export async function updateUserProfile(params) {
  const { userId } = await auth.getUserInfo();
  const res: any = await proxyRequest({
    url: `/auth/update`,
    method: 'POST',
    data: {
      id: userId,
      ...params,
    },
  });
  return res;
}

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
  archon_stats_priority: {
    priority: { key: string; label: string; value: string }[];
    relation: number[];
  };
  updated_at: string;
  comment: string;
  popular_mythic_dungeon_trinkets: string;
  ratings: { label: string; rating: number }[];
  version: string;
  mythicOverallTier: any;
  mythicDpsTier: any;
  talents: { talent: string; code: string }[];
  detailed_stats_priority: {
    best: { name: string; priorityList: string[] }[];
    overview: { text: string; spells: { id: string; name: string }[] };
  };
  enhancement: {
    slot: string;
    items: { id: number; name_zh: string; image: string }[];
  }[];
  wowhead_bis: {
    updated_at: string;
    puzzlingCartelChipAdvice: IBisItem[];
    detailedPuzzlingCartelChipAdvice: any;
  };
}

export function getImageSrc(image: string) {
  return {
    item: `https://ginkolearn.cyou/api/wow/assets/blizz-media-image/${image}`,
    thumbItem: `https://ginkolearn.cyou/api/wow/assets/blizz-media-image-thumb/${image}`,
  };
}

export function getSpellImageUrl(image: string) {
  return {
    item: `https://ginkolearn.cyou/api/wow/assets/blizz-media-image/spell/${image}`,
    thumbItem: `https://ginkolearn.cyou/api/wow/assets/blizz-media-image-thumb/spell/${image}`,
  };
}

export function getRoleSpecSrc(classSpec: string, roleClass: string) {
  return {
    specIcon: `https://ginkolearn.cyou/api/wow/assets/class-icons/${roleClass}-${classSpec}-class-icon.webp`,
  };
}

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

export async function queryBis(roleClass: string, classSpec: string) {
  const res = await proxyRequest({
    url: `/wow/bis/${roleClass}/${classSpec}`,
    method: 'GET',
  });
  const data = res.data as IBisDataDTO;

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
    data.bis_items = data.bis_items?.filter(
      item => item.items?.length && item.items[0] !== null,
    );
    data.bis_items?.forEach(
      (bisType: { items: Array<IBisItem>; title: string }) => {
        bisType.items = bisType.items.map(item => {
          if (item?.slot?.toLowerCase().includes('weapon')) {
            item.slot = '武器';
          }
          return item;
        });
      },
    );
    return data.bis_items;
  }

  function mapDetailStats(data: IBisDataDTO['detailed_stats_priority']) {
    if (data) {
      return {
        ...data,
        best: data.best.map(item => {
          return {
            ...item,
            priorityList: item.priorityList.map(item =>
              item.replaceAll('=', '/'),
            ),
          };
        }),
      };
    }
    return {};
  }

  return {
    roleClass,
    classSpec,
    detailedStatsPriority: mapDetailStats(data.detailed_stats_priority),
    archonStatsPriority: data.archon_stats_priority,
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
    talents: data.talents,
    wowheadBis: data.wowhead_bis,
    popularMythicDungeonTrinkets: data.popular_mythic_dungeon_trinkets,
    mythicOverallTier: data.mythicOverallTier,
    mythicDpsTier: data.mythicDpsTier,
  };
}

export async function queryItemPreview(id: number) {
  try {
    const res: any = await proxyRequest({
      url: `/wow/item/${id}`,
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
        [],
      );
    }

    return { data: res.data, statusCode: res.statusCode };
  } catch (error) {
    console.log({ error });
    return { data: null, statusCode: error };
  }
}

export async function querySpecPopularity(
  minMythicLevel: number,
  maxMythicLevel: number,
) {
  const res: any = await proxyRequest({
    url: `/wow/bis/popularity`,
    method: 'POST',
    data: { minMythicLevel, maxMythicLevel },
  });

  function handleLongerSpecName(name: string) {
    if (name === '野兽控制') {
      return '兽王';
    } else if (name === '恶魔学识') {
      return '恶魔';
    }
    return name;
  }

  function formatNumber(num: number) {
    if (num < 1000) {
      return num.toString();
    } else if (num >= 1000 && num < 1000000) {
      return (num / 1000).toFixed(0) + 'K';
    } else {
      return (num / 1000000).toFixed(1) + 'M';
    }
  }

  if (res.data?.data) {
    const cacheData = JSON.parse(JSON.stringify(res.data.data));

    const maxCount = {
      all: 0,
      dps: 0,
      tank: 0,
      healer: 0,
    };
    maxCount.all = cacheData.sort(
      (a, b) => b.quantity - a.quantity,
    )[0].quantity;
    maxCount.dps = cacheData
      .filter(item => item.role === 'dps')
      .sort((a, b) => b.quantity - a.quantity)[0].quantity;
    maxCount.tank = cacheData
      .filter(item => item.role === 'tank')
      .sort((a, b) => b.quantity - a.quantity)[0].quantity;
    maxCount.healer = cacheData
      .filter(item => item.role === 'healer')
      .sort((a, b) => b.quantity - a.quantity)[0].quantity;

    return {
      date: res.data.aggregated_at,
      data: res.data.data.map((item: any) => {
        const widthConfig = { allWidth: '', roleWidth: '' };
        widthConfig.allWidth = `${(
          (item.quantity / maxCount.all) *
          100
        ).toFixed(1)}%`;
        widthConfig.roleWidth = `${(
          (item.quantity / maxCount[item.role]) *
          100
        ).toFixed(1)}%`;

        const roleClass = item.class_name_en.toLowerCase().replaceAll(' ', '-');
        const classSpec = item.name_en.toLowerCase().replaceAll(' ', '-');
        return {
          ...item,
          name_zh: handleLongerSpecName(item.name_zh),
          color: (colorMap as any)[
            item.class_name_en.toLowerCase().replaceAll(' ', '-')
            ],
          ...widthConfig,
          quantityText: formatNumber(item.quantity),
          spritePosition: `${-res.data.sprite?.[roleClass][classSpec] * 20}px ${
            -res.data.sprite?.[roleClass].sort * 20
          }px`,
          roleClass,
          classSpec,
        };
      }),
    };
  } else {
    return {
      date: '未知',
      data: [],
    };
  }
}

export async function querySpecDpsRank(weekId: number) {
  const res: any = await proxyRequest({
    url: `/wow/bis/dps-rank`,
    method: 'POST',
    data: { weekId },
  });
  return {
    ...res.data,
    currentUpdatedAt: res.data.current_week_updated_at,
    data: res.data.data.map((item: any) => {
      return {
        ...item,
        rank: item.rank.map((rankItem: any) => {
          let name = localeNameMap[rankItem.roleClass][rankItem.classSpec];
          if (name === '野兽掌控') {
            name = '兽王';
          }
          return {
            ...rankItem,
            color: (colorMap as any)[rankItem.roleClass],
            name,
            totalWidth: `${
              Number(rankItem.avgWidth.replace('%', '')) +
              Number(rankItem.topWidth.replace('%', ''))
            }%`,
            spritePosition: `${
              -res.data.sprite[rankItem.roleClass][rankItem.classSpec] * 20
            }px ${-res.data.sprite[rankItem.roleClass].sort * 20}px`,
            name_zh: localeNameMap[rankItem.roleClass][rankItem.classSpec],
            class_name_zh: localeNameMap.class[rankItem.roleClass],
          };
        }),
      };
    }),
  };
}

export interface IDungeonDTO {
  id: number;
  name_zh: string;
  name_en: string;
}

export async function querySeasonDungeons() {
  try {
    const res = await proxyRequest({
      url: `/wow/dungeon/list`,
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
    const res: any = await proxyRequest({
      url: `/wow/dungeon-tip`,
      method: 'POST',
      data: {
        roleClass,
        classSpec,
        dungeonId,
      },
    });
    if (res.statusCode === 200) {
      return { isSuccess: true, data: JSON.parse(res.data.tips) };
    }
    return { isSuccess: false, data: res.data.message };
  } catch (error: any) {
    return { isSuccess: false, data: error?.message };
  }
}

export async function querySpellsInTip(ids: number[]) {
  try {
    const res: any = await proxyRequest({
      url: `/wow/spell`,
      method: 'POST',
      data: {
        ids,
      },
    });

    return res.data?.map((spell: any) => {
      return {
        ...spell,
        range: spell?.range === -1 ? '' : spell?.range,
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
    const res: any = await proxyRequest({
      url: `/wow/bis/trend`,
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
  carousels: {
    role_class: string;
    class_spec: string;
    avg: string;
    custom: boolean;
  }[];
  hotTopics: { role_class: string; class_spec: string; count: number }[];
  tierLists: { version_id: string; role: string; activity_type: string }[];
  entries: {
    feature: boolean;
    label: string;
    page: string;
    value: string;
    icon: string;
    color: string;
  }[];
  newEntries: {
    feature: boolean;
    label: string;
    page: string;
    value: string;
    icon: string;
    color: string;
  }[];
  mythicMarkCount: number;
  tarotCount: number;
  tagCardCount: number;
}

export async function queryHomeView() {
  try {
    const res: any = await proxyRequest({ url: `/wow/home-view` });
    res.data.tierLists = res.data.tierLists.map((item: any) => {
      if (item.activity_type === 'MYTHIC') {
        item.activity_name = '大秘境';
      }
      return item;
    });
    return res.data as IHomeViewDTO;
  } catch (e) {
    console.log(e);
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

    const res: any = await proxyRequest({
      url: `/wow/tier-list`,
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

export async function queryMythicDungeonById(id: number) {
  const res: any = await proxyRequest({
    url: `/wow/mythic-dungeon/${id}`,
  });

  function mapUtilityNeeds(data: any) {
    return data.map((item: any) => {
      return {
        ...item,
        spell: item.spell.filter((childItem: any) => childItem !== null),
        utility: item.utility.filter((childItem: any) => childItem !== null),
      };
    });
  }

  return {
    ...res.data,
    utilityNeeds: mapUtilityNeeds(res.data.utilityNeeds),
    ratings: res.data.ratings.map((item: any) => ({
      ...item,
      comment: item.scoreText,
      rating: mapRatings(item.score),
      ratingScore: item.score,
    })),
  };
}

export async function queryMythicDunegonList() {
  const res: any = await proxyRequest({
    url: `/wow/mythic-dungeon/list`,
  });

  function mapTierText(tier: string) {
    switch (tier) {
      case 'S':
        return '游龙';
      case 'A':
        return '简单';
      case 'B':
        return '出汗';
      case 'C':
        return '坐牢';
      default:
        break;
    }
  }

  return res.data.map((item: any) => ({
    ...item,
    tierText: mapTierText(item.tier),
  }));
}

export async function queryRaidGuide() {
  const res: any = await proxyRequest({
    url: `/wow/raid-guide`,
  });
  return res?.data?.guide ?? [];
}

export async function queryUpdateMarkStatus(params: {
  isNpc: boolean;
  isMark: boolean;
  userId: number;
  markId: number;
}) {
  const { isNpc, isMark, userId, markId } = params;
  const res: any = await proxyRequest({
    url: `/wow/mark/update`,
    method: 'POST',
    data: {
      isNpc,
      isMark,
      userId,
      markId,
    },
  });
  return res.data;
}

export async function queryUserMarks() {
  const { userId } = await auth.getUserInfo();
  try {
    const res: any = await proxyRequest({
      url: `/wow/mark/${userId}`,
    });
    if (res?.data) {
      return {
        npcs: res.data.npc_mark_list?.map(item => Number(item)),
        spells: res.data.spell_mark_list?.map(item => Number(item)),
      };
    }
    return {
      npcs: [],
      spells: [],
    };
  } catch (error) {
    return {
      npcs: [],
      spells: [],
    };
  }
}

// region /bis
export interface TalentNode {
  id: number;
  display_col: number;
  display_row: number;
  node_type: { id: number; type: string; };
  ranks: {
    rank: number;
    tooltip: {
      spell_tooltip: {
        cast_time: string;
        cooldown: string;
        description: string;
        spell: { id: number; name: string; image: string }
      }
      talent: { id: number; name: string }
    }
    choice_of_tooltips: {
      spell_tooltip: {
        cast_time: string;
        cooldown: string;
        description: string;
        spell: { id: number; name: string; image: string }
      }
      talent: { id: number; name: string }
    }[]
  }[];
  unlocks?: number[];
}

export async function queryTalent(classSpec: string, roleClass: string) {
  try {
    const res = await proxyRequest({
      url: `/wow/bis/talent?classSpec=${classSpec}&roleClass=${roleClass}`,
    });
    return res.data;
  } catch (e) {
    console.log(e);
    return {};
  }
}

// endregion

//#region /question
export interface IQuestionItem {
  dungeon_id: number;
  guide_id: number;
  guide_type: string;
  id: number;
  imageSrc: string;
  isRight: number;
  lastSelectedIndex: number;
  question_text: {
    text: string;
    options: { value: number; text: string }[];
    answer: { value: number; text: string };
  };
}

export async function queryQuestions(params: {
  dungeonId: number;
  showAvgCorrect?: boolean;
  setDefault?: number;
}) {
  const { userId } = await auth.getUserInfo();
  const res: any = await proxyRequest({
    url: `/wow/question/list`,
    method: 'POST',
    data: {
      userId,
      dungeonId: params.dungeonId,
      showAvgCorrect: params.showAvgCorrect,
    },
  });
  if (res.data?.data) {
    return {
      ...res.data,
      data: res.data.data.map(item => ({
        ...item,
        isRight: params.setDefault ? -1 : item.isRight,
        lastSelectedIndex: -1,
      })) as IQuestionItem[],
    };
  }
  return {};
}

export async function queryUpdateUserQuestion(params) {
  const { userId } = await auth.getUserInfo();
  const res: any = await proxyRequest({
    url: `/wow/question/update-user-question`,
    method: 'POST',
    data: {
      questionList: params.questionList,
      userId,
    },
  });
  return res.data;
}

export interface IQuestionDungeon {
  id: number;
  name: string;
  count: number;
  doneQuestionCount: number;
  totalQuestionCount: number;
  avgCorrect: string;
}

export async function queryQuestionDungeons() {
  const { userId } = await auth.getUserInfo();
  const res: any = await proxyRequest({
    url: `/wow/question/dungeon-list`,
    method: 'POST',
    data: {
      userId,
    },
  });
  return res.data as IQuestionDungeon[];
}

export async function queryFinishQuestionDungeon(dungeonId) {
  return proxyRequest({
    url: `/wow/question/finish`,
    method: 'POST',
    data: {
      dungeonId,
    },
  });
}

//#endregion

//#region /tarot
export interface ITarot {
  id: number;
  isPositive: boolean;
  name: string;
  name_en: string;
  negative_suggestion: string;
  negative_summary: string;
  positive_suggestion: string;
  positive_summary: string;
}

export interface IDrawTarotInfo {
  hasDraw: boolean;
  drawCardId: number;
  count: number;
  totalCount: number;
  tarot: ITarot;
}

export async function queryCheckDrawTarot() {
  const { userId } = await auth.getUserInfo();
  const res: any = await proxyRequest({
    url: `/common/tarot/check`,
    method: 'POST',
    data: {
      userId,
    },
  });
  return res.data;
}

export async function queryDrawTarot() {
  const { userId } = await auth.getUserInfo();
  const res: any = await proxyRequest({
    url: `/common/tarot/draw`,
    method: 'POST',
    data: {
      userId,
    },
  });
  return res.data;
}

//#endregion

//#region /user-tag
export interface ITagOptionItem {
  text: string;
  value: string;
  selected: boolean;
  filterMax: boolean;
  roleClass?: string;
  max: number;
  options: {
    text: string;
    value: string;
    selected: boolean;
    roleClass?: string;
    max: number;
    filterMax: boolean;
    options?: ITagOptionItem[];
  }[];
}

export interface IWowUserTagOptions {
  server: ITagOptionItem;
  jobs: ITagOptionItem;
  classes: ITagOptionItem;
  gameStyle: ITagOptionItem;
  activeTime: ITagOptionItem;
  communication: ITagOptionItem;
  spec: ITagOptionItem;
}

export interface ISpecTagOption {
  text: string;
  value: string;
  classSpec: string;
  roleClass: string;
}

export interface ICommonUserTagOptions {
  age: ITagOptionItem;
  game: ITagOptionItem;
  personality: ITagOptionItem;
  role: ITagOptionItem;
  status: ITagOptionItem;
}

export async function queryFriendOptions() {
  const res: any = await proxyRequest({
    url: `/wow/user-tag/options`,
    method: 'POST',
  });
  return res.data as {
    wowOptions: IWowUserTagOptions;
    commonOptions: ICommonUserTagOptions;
    specs: ISpecTagOption[];
  };
}

export async function queryAddUserTag(params) {
  const { battlenetId, wowTag, commonTag } = params;
  const { userId } = await auth.getUserInfo();
  const res: any = await proxyRequest({
    url: `/wow/user-tag/add`,
    method: 'POST',
    data: {
      id: userId,
      battlenetId,
      wowTag,
      commonTag,
    },
  });
  return res;
}

export async function querySubmitUserTag(params) {
  const { battlenetId, wowTag, commonTag, isEdit } = params;
  const { userId } = await auth.getUserInfo();
  const res: any = await proxyRequest({
    url: `/wow/user-tag/${isEdit ? 'update' : 'add'}`,
    method: 'POST',
    data: {
      id: userId,
      battlenetId,
      wowTag,
      commonTag,
    },
  });
  const isSuccess = res.statusCode === 200;
  return { isSuccess, message: res?.data?.message };
}

export async function queryUserTagByIds(params?: {
  id?: number;
  userId?: number;
  ids?: number[];
  userIds?: number[];
  requireRelation?: boolean;
}) {
  const { userId } = await auth.getUserInfo();

  const finalParams: any = {};
  if (params?.id || params?.userId) {
    if (params.id) {
      finalParams.ids = [params.id];
    } else {
      finalParams.userIds = [params.userId];
    }
  } else if (params?.ids) {
    finalParams.ids = params.ids;
  } else if (params?.userIds) {
    finalParams.userIds = params.userIds;
  } else {
    finalParams.userIds = [userId];
  }

  if (userId && params?.requireRelation) {
    finalParams.applicantUserId = userId;
  }

  const res: any = await proxyRequest({
    url: `/wow/user-tag/query`,
    method: 'POST',
    data: finalParams,
  });

  if (!params || params?.id) {
    return res?.data?.[0];
  }
  return res?.data;
}

export interface ITagCardItem {
  common_tag: ICommonTag;
  wow_tag: IWowTag;
  id: number;
  user_id: number;
  updated_at: string;
  type: string;
  nickName: string;
  avatarUrl: string;
  relation_status: string;
  isAd?: boolean;
  battlenet_id?: string;
}

export interface IFilterParams {
  filter: {
    wow_game_style: string[];
    wow_jobs: string[];
    wow_privacy_need_confirm: number[];
    common_status: any[];
  };
  lastId: number;
  lastUpdatedAt: string;
  pageSize: number;
}

export async function queryUserTagByFilter(params?) {
  const { userId } = await auth.getUserInfo();
  const res: any = await proxyRequest({
    url: `/wow/user-tag/list`,
    method: 'POST',
    data: {
      applicantUserId: userId,
      filter: params?.filter,
      pageSize: params?.pageSize ?? 10,
      lastId: params?.lastId,
      lastUpdatedAt: params?.lastUpdatedAt,
    },
  });
  if (res?.data?.data) {
    res.data.data = res.data.data.map(item => ({
      ...item,
      type: 'normal',
    }));
  }
  return (res?.data as { data: ITagCardItem[]; total: number }) ?? {};
}

export async function queryUserTagFilterOptions() {
  const res: any = await proxyRequest({
    url: `/wow/user-tag/filters`,
    method: 'POST',
  });
  return res.data;
}

export async function queryUpdateLastViewRelation() {
  const { userId } = await auth.getUserInfo();
  const res: any = await proxyRequest({
    url: `/wow/user-tag/update-view-relation`,
    method: 'POST',
    data: {
      userId,
    },
  });
  return res.data;
}

export async function queryNotViewedRelation() {
  const { userId } = await auth.getUserInfo();
  const res: any = await proxyRequest({
    url: `/wow/user-tag/get-view-relation`,
    method: 'POST',
    data: {
      userId,
    },
  });
  return res.data;
}

// 关系表
export async function queryAddUserTagRelation(params: {
  targetUserId: number;
  tagId: number;
  status?: 'accepted' | 'reject' | 'pending';
  isAutoApproved?: number;
}) {
  const { userId } = await auth.getUserInfo();
  const res: any = await proxyRequest({
    url: `/wow/user-tag/relation/add`,
    method: 'POST',
    data: {
      applicantUserId: userId,
      targetUserId: params.targetUserId,
      tagId: params.tagId,
      status: params.status ?? 'accepted',
      isAutoApproved: params.isAutoApproved ?? 0,
    },
  });
  return res.data;
}

export async function queryUserTagRelationByApplicantId(
  status?: 'pending' | 'accept' | 'reject',
) {
  const { userId } = await auth.getUserInfo();
  const res: any = await proxyRequest({
    url: `/wow/user-tag/relation/applicant`,
    method: 'POST',
    data: {
      userId,
      status,
    },
  });
  return res.data as IRelationItem[];
}

export async function queryUserTagRelationByTargetId(
  status?: 'pending' | 'accept' | 'reject',
) {
  const { userId } = await auth.getUserInfo();
  const res: any = await proxyRequest({
    url: `/wow/user-tag/relation/target`,
    method: 'POST',
    data: {
      userId,
      status,
    },
  });
  return res.data as IRelationItem[];
}

//#endregion
