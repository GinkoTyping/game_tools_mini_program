import { getDB } from '../../database/utils/index.js';
import { useNpcMapper } from '../../database/wow/mapper/npcMapper.js';

const db = await getDB();
const npcMapper = useNpcMapper(db);

export async function queryUpdateNpc(req, res) {
  const { id, name_zh, name_en, location, type } = req.body;
  await npcMapper.updateNpc({ id, name_zh, name_en, location, type });
  res.json(`更新NPC成功: ${id} ${name_zh ?? name_en}`);
}

export async function queryAddNpc(req, res) {
  const { id, name_zh, name_en, location, type } = req.body;
  await npcMapper.insertNpc({ id, name_zh, name_en, location, type });
  res.json(`新增NPC成功: ${id} ${name_zh ?? name_en}`);
}

export async function queryNpcById(req, res) {
  const id = req.params.id;
  const data = await npcMapper.getNpcById(id);
  if (!data) {
    res.statusCode = 205;
  }
  res.json(data);
}

export async function queryNpcToTranslate(req, res) {
  const data = await npcMapper.getNpcWithNoNameZh();
  res.json(data);
}

export async function queryNpcByNameEn(req, res) {
  const name = req.body.name;
  const data = await npcMapper.getNpcByNameEn(name);
  res.json(data);
}
