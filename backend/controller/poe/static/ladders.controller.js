import { collectAll } from '../../../database/poe2/data/ladders/crawler.js';
import { useLadderMapper } from '../../../database/poe2/mapper/dynamic/ladder.mapper.js';
import { getDynamicPoeDB } from '../../../database/utils/index.js';
import { formatDateByMinute } from '../../../util/time.js';

const db = await getDynamicPoeDB();
const ladderMapper = useLadderMapper(db);

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

export async function queryUpdateLadders(req, res) {
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
  try {
    const rawData = await collectAll(req.body.useCache);
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
      throw new Error(`更新失败：${errors?.length}条`);
    }
    res.json({ message: `更新OK: ${total}条` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
