import Bottleneck from 'bottleneck';

import setBlizzAPI from '../../../../util/blizz.js';
import { getDB } from '../../../utils/index.js';
import { useItemMapper } from '../../mapper/itemMapper.js';

const db = await getDB();
const itemMapper = useItemMapper(db);
const api = setBlizzAPI();

async function updateItemSlot(id, preview, version) {
  let slot;
  let data;
  if (preview?.inventory_type?.name) {
    slot = preview.inventory_type.name;
  } else {
    data = await api.query(`/data/wow/item/${id}`, {
      params: {
        namespace: version === 'wotlk' ? 'static-classic-us' : 'static-us',
        locale: 'zh_CN',
      },
    });
    slot = data.inventory_type?.name;
  }
  if (slot) {
    itemMapper.updateItemById({ id: id, slot, preview: data }, version);
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

export async function main(version) {
  const data = await itemMapper.getBlankSlotItem(version);
  total = data.length;
  const results = await Promise.allSettled(
    data.map((item) =>
      limiter.schedule(() => updateItemSlot(item.id, JSON.parse(item.preview), version)),
    ),
  );
  const errors = results.filter((item) => item.status !== 'fulfilled');
  if (errors.length) {
    console.log('查询失败：' + errors.length);
  }
}

main('wotlk');
