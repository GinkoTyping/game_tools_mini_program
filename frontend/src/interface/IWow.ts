export interface IBisItem {
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
  trinkets: string[];
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
