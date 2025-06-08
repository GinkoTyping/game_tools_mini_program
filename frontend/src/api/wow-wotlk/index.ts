import { proxyRequest } from '../config';

export async function queryBis(
  roleClass: string,
  classSpec: string,
  type: string,
) {
  const res = await proxyRequest({
    url: '/wow/wotlk/bis',
    method: 'post',
    data: { roleClass, classSpec, type },
  });
  return res;
}
