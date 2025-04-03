export interface IOptionItem {
  text: string;
  value: string;
}

export interface IActiveTimeBar {
  text: string;
  value: number;
  selected: boolean;
}
export interface ISpecOptionItem extends IOptionItem {
  roleClass: string;
  classSpec: string;
}
export interface IWowTag {
  server: IOptionItem[];
  jobs: IOptionItem[];
  spec: ISpecOptionItem[];
  classes: IOptionItem[];
  gameStyle: IOptionItem[];
  communication: IOptionItem[];
  activeTime: {
    title: string;
    values: IActiveTimeBar[];
  }[];
  privacy: { needConfirm: boolean; displayWxProfile: boolean };
}

export interface ICommonTag {
  status: IOptionItem[];
  game: IOptionItem[];
  age: IOptionItem[];
  personality: IOptionItem[];
  role: IOptionItem[];
}

export interface IRelationItem {
  id: number;
  applicantUserId: number;
  targetUserId: number;
  tagId: number;
  status: string;
  rejectReason: string;
  isAutoApproved: boolean;
  createdAt: string;
  updatedAt: string;
}
