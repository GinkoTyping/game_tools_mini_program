import { useLadderMapper } from '../../../database/poe2/mapper/static/ladder.mapper.js';

const ladderMapper = useLadderMapper();

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
