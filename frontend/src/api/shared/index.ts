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
