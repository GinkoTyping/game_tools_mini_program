export interface IBisItem {
  id: number;
  name: string;
  slot: string;
  item: string;
  source: string;
  image: string;
  wrap?: boolean;
  isLoot?: boolean;
}

export interface ITrinks {
  label: string;
  trinkets: { image: string; id: number }[];
}

export interface ISpceBIS {
  classSpec: string;
  updatedAt: string;
  statsPriority: IStatPriority[];
  overall: IBisItem[];
  bisItemRaid: IBisItem[];
  bisItemMythic: IBisItem[];
  trinkets: ITrinks[];
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
