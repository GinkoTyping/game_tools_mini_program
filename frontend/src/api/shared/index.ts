import { BASE_URL } from '../config';

export async function getAccessCount() {
  try {
    const res = await uni.request({
      url: `${BASE_URL}/common/access-count`,
    });
    return res.data;
  } catch (error) {
    return 0;
  }
}

export async function queryScorllInfo() {
  const res = await uni.request({
    url: `${BASE_URL}/common/scroll-info`,
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
  const res = await uni.request({
    url: `${BASE_URL}/common/advice/list`,
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
  const res = await uni.request({
    url: `${BASE_URL}/common/patch/list`,
  });
  return res.data as IPatch;
}

export async function queryLogin(code: string) {
  try {
    const res: any = await uni.request({
      url: `${BASE_URL}/auth/login`,
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
