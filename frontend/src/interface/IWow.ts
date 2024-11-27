export interface IBisItem {
  slot: string;
  item: string;
  source: string;
  itemIcon: string;
  wrap?: boolean;
  isLoot?: boolean;
}

export interface ITrinks {
  label: string;
  trinkets: string[];
}

export interface ISpceBIS {
  spec: string;
  collectedAt: string;
  statsPriority: string;
  overall: IBisItem[];
  bisItemRaid: IBisItem[];
  bisItemMythic: IBisItem[];
  trinkets: ITrinks[];
}

export interface IWowBIS {
  [key: string]: ISpceBIS[];
}
