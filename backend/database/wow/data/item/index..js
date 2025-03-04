// TODO: 手动获取 blizz 数据库中的物品信息，更新数据库
import { queryBlizzItemById } from '../../../../controller/wow/bisController.js';
import { useItemMapper } from './mapper/itemMapper.js';
const itemMapper = useItemMapper(database);

async function updateItemDataByBlizz() {
  const data = await itemMapper.getUntranslated();
  async function updateEachItem(item) {
    const blizzData = await queryBlizzItemById(item.id);
    await itemMapper.updateItemById({
      id: item.id,
      slot: blizzData.inventory_type.name,
      item: blizzData.name,
      preview: JSON.stringify(blizzData),
    });
  }
  const promises = data.map((item) => updateEachItem(item));
  const results = await Promise.allSettled(promises);
  const errors = results.filter((result) => result.status !== 'fulfilled');
  if (errors.length) {
    console.log(`装备获取失败计数: ${errors.length}`);
  } else {
    console.log(`更新装备信息成功计数: ${results.length}`);
  }
}

updateItemDataByBlizz();