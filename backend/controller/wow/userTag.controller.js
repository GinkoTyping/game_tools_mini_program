import { getDynamicDB } from '../../database/utils/index.js';
import { useUserTagMapper } from '../../database/wow/mapper/dynamic/userTag.mapper.js';

const db = await getDynamicDB();
const userTagMapper = useUserTagMapper(db);

export async function queryUserTagOptions(req, res) {
  const data = await userTagMapper.getTagOptions();
  res.json(data);
}

export async function queryAddUserTag(req, res) {
  const { id, battlenetId, wowTag, commonTag } = req.body;
  const result = await userTagMapper.insertUserTag({
    id,
    wowTag,
    commonTag,
    battlenetId,
  });
  if (result.changes) {
    res.json({ message: '注册用户铭牌成功！' });
  } else {
    res.status(500).json({ message: '注册铭牌失败' });
  }
}

export async function queryUserTagByIds(req, res) {
  const { ids } = req.body;
  const list = await userTagMapper.getUserTagByIds(ids);
  res.json(list);
}
