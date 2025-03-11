import { proxyRequest } from '../config';

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

export async function queryLogin(code: string) {
  try {
    const res: any = await proxyRequest({
      url: `/auth/login`,
      method: 'POST',
      data: {
        code,
      },
    });
    return res.data;
  } catch (error) {
    return { error };
  }
}
