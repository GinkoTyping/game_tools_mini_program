import { getCommonDB } from '../../database/utils/index.js';
import { usePatchMapper } from '../../database/common/mapper/patchMapper.js';

let db = await getCommonDB();
const patchMapper = usePatchMapper(db);

export async function queryPatchList(req, res) {
  const data = await patchMapper.getPactchList();
  res.json(data.slice(0, 5));
}
