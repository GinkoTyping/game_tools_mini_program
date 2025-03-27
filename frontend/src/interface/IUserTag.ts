export interface IOptionItem {
  text: string;
  value: string;
}

export interface IWowTag {
  jobs: IOptionItem[];
  classes: IOptionItem[];
  gameStyle: IOptionItem[];
  activeTime: {
    title: string;
    values: { text: string; value: number; selected: boolean }[];
  }[];
  privacy: { needConfirm: boolean };
}

export interface ICommonTag {
  status: IOptionItem[];
  game: IOptionItem[];
  age: IOptionItem[];
  personality: IOptionItem[];
  role: IOptionItem[];
}
