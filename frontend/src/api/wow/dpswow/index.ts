import { proxyRequest } from '@/api/config';

interface QueryDpsWowParamsDTO {
  page: number;
  size: number;
  className?: string;
  spec?: string;
  rankType?: 1 | 2;
}

function mapQueryDpsWowDTO(params) {
  const output = { ...params };
  if (output.className === 'deathknight') {
    output.className = 'death-knight';
  } else if (output.className === 'demonhunter') {
    output.className = 'demon-hunter';
  }
  output.spec = output.spec?.replaceAll('_', '-');
  return output;
}

function mapQueryDpsWowParams(params) {
  const output = { ...params };
  if (output.className === 'death-knight') {
    output.className = 'deathknight';
  } else if (output.className === 'demon-hunter') {
    output.className = 'demonhunter';
  }
  output.spec = output.spec?.replaceAll('-', '_');
  return output;
}


export async function queryDpsWowList(params: QueryDpsWowParamsDTO) {
  const { data } = (await proxyRequest({
    url: '/wow/bis/dpswow/list',
    method: 'POST',
    data: mapQueryDpsWowParams(params),
  }) as any);
  if (data?.data?.list) {
    data.data.list = data.data.list.map(item => mapQueryDpsWowDTO(item));
  }
  return data?.data;
}
