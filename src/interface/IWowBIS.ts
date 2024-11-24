export interface IBisItem {
  slot: string;
  item: string;
  source: string;
  itemIcon: string;
}

export interface ITrinks {
  label: string;
  trinkets: string[];
}

export interface IWowBIS {
  [key: string]: {
    spec: string;
    collectedAt: string;
    statsPriority: string;
    overall: IBisItem[];
    bisItemRaid: IBisItem[];
    bisItemMythic: IBisItem[];
    trinkets: ITrinks[];
  }[];
}
