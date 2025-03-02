import { getCommonDB } from '../../database/utils/index.js';
import { usePatchMapper } from '../../database/wow/mapper/patchMapper.js';

let db = await getCommonDB();
const patchMapper = usePatchMapper(db);

export async function queryPatchList(req, res) {
  const data = await patchMapper.getPactchList();
  res.json(data);
}
