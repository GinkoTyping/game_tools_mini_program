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
