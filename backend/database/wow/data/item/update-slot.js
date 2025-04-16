import Bottleneck from 'bottleneck';

import setBlizzAPI from '../../../../util/blizz.js';
import { getDB } from '../../../utils/index.js';
import { useItemMapper } from '../../mapper/itemMapper.js';

const db = await getDB();
const itemMapper = useItemMapper(db);
const api = setBlizzAPI();

async function updateItemSlot(id, preview) {
  let slot;
  if (preview?.inventory_type?.name) {
    slot = preview.inventory_type.name;
  } else {
    const data = await api.query(`/data/wow/item/${id}`, {
      params: {
        namespace: 'static-us',
        locale: 'zh_CN',
      },
    });
    slot = data.inventory_type?.name;
  }
  if (slot) {
    itemMapper.updateItemById({ id: id, slot });
  }
}

const limiter = new Bottleneck({
  minTime: 20, // 20ms间隔 → 50次/秒
});
export async function main() {
  const data = await itemMapper.getBlankSlotItem();
  const results = await Promise.allSettled(
    data.map((item) =>
      limiter.schedule(() => updateItemSlot(item.id, item.preview))
    )
  );
  const errors = results.filter((item) => item.status !== 'fulfilled');
  if (errors.length) {
    console.log('下载失败：' + errors.length);
  }
}

main();
