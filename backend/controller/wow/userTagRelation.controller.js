import { getDynamicDB } from '../../database/utils/index.js';
import { useUserTagRelationMapper } from '../../database/wow/mapper/dynamic/userTagRelation.mapper.js';

const db = await getDynamicDB();
const userTagRelationMapper = useUserTagRelationMapper(db);

export async function queryRelationByApplicantUserId(req, res) {
  const { userId, status } = req.body;
  const data = await userTagRelationMapper.getRelationsByApplicant(
    userId,
    status
  );

  res.json(data);
}
