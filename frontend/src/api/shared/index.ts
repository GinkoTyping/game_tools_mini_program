import { proxyRequest } from '../config';
import { useAuth } from '@/hooks/auth';

export async function queryScorllInfo() {
  const res = await proxyRequest({
    url: `/common/scroll-info`,
  });
  return res.data as string;
}

interface IAdvice {
  id: number;
  name: string;
  note: string;
  status: number;
  completed_at: string;
  completion_images: string;
  completion_text: string;
  created_at: string;
}
export async function queryAdviceList() {
  const res = await proxyRequest({
    url: `/common/advice/list`,
  });
  return (res.data as IAdvice[]).reduce(
    (pre: any, cur: IAdvice) => {
      pre[cur.status].push(cur);
      return pre;
    },
    [[], []]
  );
}

interface IPatch {
  date: string;
  text: string;
  images: string;
}
export async function queryPatchList() {
  const res = await proxyRequest({
    url: `/common/patch/list`,
  });
  return res.data as IPatch;
}

//#region 广告
export interface IUserAd {
  count: number;
  isFreeAd: boolean;
  freeLeft: string;
  lastUntil: string;
}
let auth;
export async function queryAdCount() {
  auth = auth ?? useAuth();
  const { userId } = await auth.getUserInfo();
  const res: any = await proxyRequest({
    url: `/common/ad/query`,
    method: 'POST',
    data: {
      id: userId,
    },
  });
  return res.data as IUserAd;
}

export async function queryUpdateAdCount() {
  auth = auth ?? useAuth();
  const { userId } = await auth.getUserInfo();
  const res: any = await proxyRequest({
    url: `/common/ad/update`,
    method: 'POST',
    data: {
      id: userId,
    },
  });

  return res.data;
}
//#endregion
