import Bottleneck from 'bottleneck';

import path from 'path';
import { fileURLToPath } from 'url';

import setBlizzAPI from '../../../../util/blizz.js';
import { downloadSingle } from '../../../../util/download.js';
import { getDB } from '../../../utils/index.js';
import { useItemMapper } from '../../mapper/itemMapper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = await getDB();
const itemMapper = useItemMapper(db);
const api = setBlizzAPI();

async function updateItemImage(id, version) {
  try {
    const data = await api.query(`/data/wow/media/item/${id}`, {
      params: {
        namespace: version === 'wotlk' ? 'static-classic-us' : 'static-us',
        locale: 'zh_CN',
      },
    });
    const folder = version === 'wotlk' ? 'blizz-media-image-wotlk' : 'blizz-media-image';
    if (data.assets?.[0]?.value) {
      const image = data.assets[0].value.split('/').pop();
      await downloadSingle(
        data.assets[0].value,
        path.resolve(
          __dirname,
          `../../../../assets/wow/${folder}/${image}`,
        ),
      );

      itemMapper.updateItemById({ id: id, itemIcon: image }, version);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

const limiter = new Bottleneck({
  minTime: 50, // 50ms间隔 → 20次/秒
});

export async function main(version) {
  const data = await itemMapper.getInvalidImageItem(version);
  const results = await Promise.allSettled(
    data.map((item) => limiter.schedule(() => updateItemImage(item.id, version))),
  );
  const errors = results.filter((item) => item.status !== 'fulfilled');
  if (errors.length) {
    console.log('下载失败：' + errors.length);
  }
}

main();
