import Bottleneck from 'bottleneck';

import SetBlizzAPI from '../../../../util/blizz.js';
import { getDB } from '../../../utils/index.js';
import { useDungeonMapper } from '../../mapper/dungeonMapper.js';

const db = await getDB();
const dungeonMapper = useDungeonMapper(db);
const api = SetBlizzAPI();

const limiter = new Bottleneck({
  maxConcurrent: 20,
  minTime: 30,
});

async function updateDungeonTable() {
  const dungeons = await dungeonMapper.getDungeonList();
  const expansions = await api.query(`/data/wow/journal-expansion/index`, {
    params: {
      namespace: 'static-us',
      locale: 'zh_CN',
    },
  });
  const currentExpansionId = expansions.tiers.pop().id;
  const journals = await api.query(
    `/data/wow/journal-expansion/${currentExpansionId}`,
    {
      params: {
        namespace: 'static-us',
        locale: 'zh_CN',
      },
    },
  );

  async function updateDungeonItem(dungeon, journals) {
    try {
      const journal = journals.dungeons.find(
        (item) => item.name === dungeon.name_zh || item.id === dungeon.journal_id,
      );
      if (journal) {
        const dungeonDetail = await api.query(
          `/data/wow/journal-instance/${journal.id}`,
          {
            params: {
              namespace: 'static-us',
            },
          },
        );

        const bosses = dungeonDetail.encounters.map((boss) => {
          return {
            ...boss,
            name: {
              zh_CN: boss.name.zh_CN,
              en_US: boss.name.en_US,
            },
          };
        });

        await dungeonMapper.updateDungeonById({
          bosses: JSON.stringify(bosses),
          journalId: journal.id,
          id: dungeon.id,
        });
        console.log(`已更新：${dungeon.name_zh}`);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const promises = dungeons.map((item) =>
    limiter.schedule(() => updateDungeonItem(item, journals)),
  );
  const results = await Promise.allSettled(promises);
  const errors = results.filter((result) => result.status !== 'fulfilled');
  if (errors.length) {
    console.log(`更新地下城数据失败： ${errors.length}个`);
  }
}

updateDungeonTable();
