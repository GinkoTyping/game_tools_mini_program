import Bottleneck from 'bottleneck';

import setBlizzAPI from '../../../../util/blizz.js';
import { getDB } from '../../../utils/index.js';
import { useItemMapper } from '../../mapper/itemMapper.js';

const db = await getDB();
const itemMapper = useItemMapper(db);
const api = setBlizzAPI();

async function updateItemSlot(id, preview) {
  let name;
  let data;
  if (preview?.inventory_type?.name) {
    name = preview.inventory_type.name;
  } else {
    data = await api.query(`/data/wow/item/${id}`, {
      params: {
        namespace: 'static-us',
        locale: 'en_US',
      },
    });
    name = data.name;
  }
  if (name) {
    await itemMapper.updateItemById({
      id: id,
      name_en: name,
      preview_en: data,
    });
  }

  current++;
  console.log(`已完成 ${current}/${total}`);
}

const limiter = new Bottleneck({
  minTime: 15, // 20ms间隔 → 50次/秒
  maxConcurrent: 50,
});
let total = 0;
let current = 0;
export async function main() {
  const data = await itemMapper.getBlankEnItem();
  total = data.length;
  const results = await Promise.allSettled(
    data.map((item) =>
      limiter.schedule(() => updateItemSlot(item.id, item.preview_en))
    )
  );
  const errors = results.filter((item) => item.status !== 'fulfilled');
  if (errors.length) {
    console.log('下载失败：' + errors.length);
  }
}

main();
