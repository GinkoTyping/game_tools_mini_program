import { proxyRequest } from '../config';

interface ILadderTableConfig {
  time: string;
  columns: string[];
  columnDisplay: string[];
  rowDisplay: string[];
}

export interface ITopLadders extends ILadderTableConfig {
  data: {
    label: string;
    desc: string;
    key: string;
    data: { [key: string]: string }[];
  }[];
}

export interface IDetailLadder extends ILadderTableConfig {
  data: { [key: string]: string }[];
}

export async function getTopLadders() {
  const res = await proxyRequest({
    url: `/poe/static/top-ladders`,
    method: 'GET',
  });
  return res.data as ITopLadders;
}

export async function queryLadder(params) {
  const { pageSize, lastRank, type } = params;
  const res = await proxyRequest({
    url: `/poe/static/ladder`,
    method: 'POST',
    data: {
      pageSize: pageSize ?? 10,
      lastRank: lastRank ?? 0,
      type,
    },
  });
  return res.data as IDetailLadder;
}

export interface IAscendancyLadderData {
  type: string;
  updated_at: string;
  rankData: {
    ascendancy: string;
    ascendancyEn: string;
    count: number;
    percentage: string;
  };
  display: boolean;
}
export async function queryAscendancyLadders() {
  const res = await proxyRequest({
    url: `/poe/static/top-ascendancies/all`,
    method: 'GET',
  });
  return res.data as IAscendancyLadderData[];
}
