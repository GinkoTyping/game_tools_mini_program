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

export async function queryAddRelationStatusByApplicantId(req, res) {
  try {
    const data = await userTagRelationMapper.insertRelation(req.body);

    if (data.changes) {
      res.json({ message: '修改成功！' });
    } else {
      res.status(500).json({ message: '修改失败' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
