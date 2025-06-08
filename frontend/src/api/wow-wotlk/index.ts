import { proxyRequest } from '../config';

export interface WotlkTalent {
  name: string;
  ranks: number[];
  requiredPoints: number;
  index: number;
  selfIndex: number;
}

export interface WotlkSelectedTalent {
  index: number;
  points: number;
  maxPoints: number;
}

interface WotlkTalentDTO {
  talent_groups: Array<{ slug: string; talents: WotlkTalent[] }>;
  talent: {
    build: {
      glyphs: Array<{ type: string; glyphs: number[] }>;
      talent: Array<WotlkSelectedTalent>
    };
    leveling: {
      glyphs: Array<{ type: string; glyphs: number[] }>;
      talent: Array<{ index: number; points: number; maxPoints: number; }>
    }
  };
}

export async function queryBis(
  roleClass: string,
  classSpec: string,
  type: string,
) {
  const res = await proxyRequest({
    url: '/wow/wotlk/bis',
    method: 'post',
    data: { roleClass, classSpec, type },
  });
  return res.data as WotlkTalentDTO;
}
