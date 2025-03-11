import { getDynamicDB } from '../../database/utils/index.js';
import { useUserMarkMapper } from '../../database/wow/mapper/userMarkMapper';
import { useNpcAndSpellMarkMapper } from '../../database/wow/mapper/npcAndSpellMarkMapper';

const dynamicDB = await getDynamicDB();
const userMarkMapper = useUserMarkMapper(dynamicDB);
const npcAndSpellMarkMapper = useNpcAndSpellMarkMapper(dynamicDB);

export async function queryUpdateMarkStatus(req, res) {}
