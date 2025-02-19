import { getDB } from '../../database/utils/index.js';
import { useTierListMapper } from '../../database/wow/mapper/tierListMapper.js';

const db = await getDB();
const tierListMapper = useTierListMapper(db);

export async function queryTierList(req, res) {
  const versionId = req.params.versionId;

  if (versionId) {
    const data = await tierListMapper.getTierListByVersion(versionId);
    res.json(data);
  } else {
    res.json(null);
  }
}
