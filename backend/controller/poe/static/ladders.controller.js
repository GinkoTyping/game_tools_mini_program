import { collectAll } from '../../../database/poe2/data/ladders/crawler.js';
import { useAscendancyLadderMapper } from '../../../database/poe2/mapper/dynamic/ascendancyLadder.mapper.js';
import { useLadderMapper } from '../../../database/poe2/mapper/dynamic/ladder.mapper.js';
import { getDynamicPoeDB } from '../../../database/utils/index.js';
import { formatDateByMinute } from '../../../util/time.js';

const db = await getDynamicPoeDB();
const ladderMapper = useLadderMapper(db);
const ascendancyLadderMapper = useAscendancyLadderMapper(db);

export async function queryLadderData(req, res) {
  try {
    const ladderData = await ladderMapper.getData();
    if (ladderData?.data?.length) {
      ladderData.data = ladderData.data.map((item) => ({
        ...item,
        data: item.data.slice(0, 10),
      }));
    }
    res.status(200).json(ladderData);
  } catch (error) {
    console.error('Error fetching ladder data:', error);
    res.status(500).json({ error: 'Failed to fetch ladder data' });
  }
}

const BASIC_TABLE = {
  columnDisplay: [1, 1, 0, 1, 1, 0],
  columns: ['排名', '账号', '角色名', '职业', '等级', '经验'],
  rowDisplay: ['rank', 'account_name', 'class_name', 'level'],
};
export async function queryLadderTop(req, res) {
  try {
    const results = await Promise.allSettled(
      [
        'DotH_standard',
        'DotH_hc',
        'DotH_ssf',
        'DotH_hc_ssf',
        'standard',
        'hc',
        'ssf',
        'hc_ssf',
      ].map((item) => ladderMapper.getLaddersTop(item))
    );
    const [
      DotH_standard,
      DotH_hc,
      DotH_ssf,
      DotH_hc_ssf,
      standard,
      hc,
      ssf,
      hcSsf,
    ] = results.map((item) => item.value);
    res.status(200).json({
      ...BASIC_TABLE,
      // 每个表单独统计？
      time: DotH_standard?.[0]?.updated_at,
      data: [
        {
          label: '狩猎黎明 标准模式',
          desc: '',
          key: 'DotH_standard',
          data: DotH_standard,
        },
        {
          label: '狩猎黎明 硬核模式',
          desc: '一命',
          key: 'DotH_hc',
          data: DotH_hc,
        },
        {
          label: '狩猎黎明 SSF模式',
          desc: '无法组队、交易',
          key: 'DotH_ssf',
          data: DotH_ssf,
        },
        {
          label: '狩猎黎明 硬核SSF模式',
          desc: '一命且无法组队、交易',
          key: 'DotH_hc_ssf',
          data: DotH_hc_ssf,
        },

        {
          label: '标准模式',
          desc: '',
          key: 'standard',
          data: standard,
        },
        {
          label: '硬核模式',
          desc: '一命',
          key: 'hc',
          data: hc,
        },
        {
          label: 'SSF模式',
          desc: '无法组队、交易',
          key: 'ssf',
          data: ssf,
        },
        {
          label: '硬核SSF模式',
          desc: '一命且无法组队、交易',
          key: 'hc_ssf',
          data: hcSsf,
        },
      ],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
export async function queryAscendancyRanks(req, res) {
  try {
    const data = await ascendancyLadderMapper.getByType(
      req.params.type === 'all' ? '' : req.params.type
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function queryLadderByTypeAndPaging(req, res) {
  try {
    const { pageSize, lastRank, type } = req.body;
    const data = await ladderMapper.getLaddersByTypeAndPaging({
      pageSize,
      lastRank,
      type,
    });
    res.json({ ...BASIC_TABLE, time: formatDateByMinute(), data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

function mapLadderType(index) {
  const types = [
    'DotH_standard',
    'DotH_hc',
    'DotH_ssf',
    'DotH_hc_ssf',
    'standard',
    'hc',
    'ssf',
    'hc_ssf',
  ];
  return types[index];
}
function mapAscendancy(dataItem) {
  const sortedData = dataItem.data
    .reduce((pre, cur) => {
      const ascendancy = cur[3].split('|')[0];
      const ascendancyEn = cur[3].split('|')[1];
      const existed = pre.find((item) => item.ascendancyEn === ascendancyEn);
      if (existed) {
        existed.count++;
      } else {
        pre.push({
          ascendancy,
          ascendancyEn,
          count: 1,
        });
      }
      return pre;
    }, [])
    .sort((a, b) => b.count - a.count);
  const maxCount = sortedData[0].count;
  function mapAscendancyBaseClass(ascendancy) {
    if (['titan', 'warbringer', 'smith of kitava'].includes(ascendancy)) {
      return 'warrior';
    }
    if (['deadeye', 'pathfinder'].includes(ascendancy)) {
      return 'ranger';
    }
    if (['amazon', 'ritualist'].includes(ascendancy)) {
      return 'huntress';
    }
    if (['infernalist', 'blood mage', 'lich'].includes(ascendancy)) {
      return 'witch';
    }
    if (['stormweaver', 'chronomancer'].includes(ascendancy)) {
      return 'sorceress';
    }
    if (['tactician', 'witchhunter', 'gemling legionnaire'].includes(ascendancy)) {
      return 'mercenary';
    }
    if (['invoker', 'acolyte of chayula'].includes(ascendancy)) {
      return 'monk';
    }
  }
  return {
    ...dataItem,
    data: sortedData.map((item) => ({
      ...item,
      percentage: `${((item.count / maxCount) * 100).toFixed(1)}%`,
      class: mapAscendancyBaseClass(item.ascendancyEn.toLowerCase()),
    })),
  };
}
async function updateAscendancyLadders(dataByType) {
  const rankDataList = dataByType.map((item) => mapAscendancy(item));
  const results = await Promise.allSettled(
    rankDataList.map((item) =>
      ascendancyLadderMapper.addByType(item.type, item)
    )
  );
  const errors = results.filter((item) => item.status !== 'fulfilled')?.length;
  if (errors?.length) {
    throw new Error(`更新升华排名失败：${errors?.length}条`);
  }
}
export async function queryUpdateLadders(req, res) {
  try {
    const rawData = await collectAll(req.body.useCache);

    // 更新 按升华的排名
    await updateAscendancyLadders(rawData.data);

    // 更新 按游戏用户的排名
    const lists = rawData.data.map((item, index) => {
      const request = item.data.map((row) => {
        const className = row[3].split('|')[0];
        const classNameEn = row[3].split('|')[1];
        row.splice(3, 1, className, classNameEn);
        return ladderMapper.insertLadders(mapLadderType(index), row);
      });
      return request;
    });

    const allList = lists.flat();
    const total = allList.length;
    const results = await Promise.allSettled(allList);
    const errors = results.filter(
      (item) => item.status !== 'fulfilled'
    )?.length;
    if (errors?.length) {
      throw new Error(`更新POE LADDERS失败：${errors?.length}条`);
    }
    res.json({ message: `更新POE LADDERS 成功: ${total}条` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
