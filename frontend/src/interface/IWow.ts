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
  statsPriority: string;
  overall: IBisItem[];
  bisItemRaid: IBisItem[];
  bisItemMythic: IBisItem[];
  trinkets: ITrinks[];
}

export interface IWowBIS {
  [key: string]: ISpceBIS[];
}
