import { proxyRequest } from '../config';

export interface ILadderData {
  time: string;
  columns: string[];
  data: { label: string; data: string[] }[];
}

export async function getTopLadders() {
  const res = await proxyRequest({
    url: `/poe/static/top-ladders`,
    method: 'GET',
  });
  return res.data as ILadderData;
}

export async function queryLadder(params) {
  const { pageSize, pageNo, type } = params;
  const res = await proxyRequest({
    url: `/poe/static/ladder`,
    method: 'POST',
    data: {
      pageSize: pageSize ?? 10,
      pageNo: pageNo ?? 1,
      type,
    },
  });
  return res.data;
}
