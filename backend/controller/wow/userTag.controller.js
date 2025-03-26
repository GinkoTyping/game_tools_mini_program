import { getDynamicDB } from '../../database/utils/index.js';
import { useUserTagMapper } from '../../database/wow/mapper/dynamic/userTag.mapper.js';

const db = await getDynamicDB();
const userTagMapper = useUserTagMapper(db);

export async function queryFriendOptions(req, res) {
  const data = await userTagMapper.getTagOptions();
  res.json(data);
}
