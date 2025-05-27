export interface IBisItem {
  id: number;
  name: string;
  slot: string;
  item: string;
  source: { source: string; isLoot: boolean };
  image: string;
  wrap?: boolean;
  enhancements: {
    id: number;
    image: string;
    item_class: string;
    name: string;
  }[];
}

export interface ITrinks {
  label: string;
  trinkets: { image: string; id: number }[];
}

export interface ISpceBIS {
  classSpec: string;
  updatedAt: string;
  statsPriority: IStatPriority[];
  trinkets: ITrinks[];
  bisItems: { items: Array<IBisItem>; title: string }[];
  ratings: {
    label: string;
    rating: number[];
    ratingScore: number;
    comment: string;
  }[];
}

export interface IWowBIS {
  [key: string]: ISpceBIS[];
}

export enum Relation {
  Equal = 0,
  Greater = 1,
  Greate_Greater = 2,
  Greater_Or_Equal = 10,
}

export interface IStatPriority {
  desc: string[];
  relations: Relation[];
  stats: string[];
  talentId: number;
  talentLabel: string;
}

export interface ISpell {
  name_zh: string;
  name_en: string;
  range: string;
  cast_time: string;
  cooldown: string;
  cost: string;
  description: string;
  rank?: string;
}
