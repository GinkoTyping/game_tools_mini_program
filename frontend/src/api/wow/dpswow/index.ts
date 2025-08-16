import { proxyRequest } from '@/api/config';

interface QueryDpsWowParamsDTO {
  page: number;
  size: number;
  className?: string;
  spec?: string;
  rankType?: 1 | 2;
}

export function queryDpsWowList(params: QueryDpsWowParamsDTO) {
  return proxyRequest({
    url: '/bis/dpswow/list',
    method: 'POST',
    data: params,
  });
}
