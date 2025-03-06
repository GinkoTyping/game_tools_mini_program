import { getCommonDB } from '../../database/utils/index.js';
import { useAdviceMapper } from '../../database/common/mapper/adviceMapper.js';

let db = await getCommonDB();
const adviceMapper = useAdviceMapper(db);

export async function queryAdviceList(req, res) {
  const data = await adviceMapper.getAdviceList();
  res.json(data);
}
