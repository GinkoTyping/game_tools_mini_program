import { proxyRequest } from '../config';

export interface ILadderData {
  time: string;
  columns: string[];
  data: { label: string; data: string[] }[];
}
export async function getLadders() {
  const res = await proxyRequest({
    url: `/poe/static/ladders`,
    method: 'GET',
  });
  return res.data as ILadderData;
}

export async function getTopLadders() {
  const res = await proxyRequest({
    url: `/poe/static/top-ladders`,
    method: 'GET',
  });
  return res.data as ILadderData;
}