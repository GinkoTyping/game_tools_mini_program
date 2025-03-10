import { getDB, getDynamicDB } from '../../../utils/index.js';
import { useSpecBisCountMapper } from '../../mapper/specBisCountMapper.js';
import { useBisMapper } from '../../mapper/bisMapper.js';

const db = await getDB();
const bisMapper = useBisMapper(db);

const dynamicDB = await getDynamicDB();
const specBisCountMapper = useSpecBisCountMapper(dynamicDB);

async function main() {
  const bisItems = await bisMapper.getAllBis();
  const results = await Promise.allSettled(
    bisItems.map((item) =>
      specBisCountMapper.insertSpecBisCount({
        ...item,
        count: item.access_count,
      })
    )
  );
  console.log(results);
}

main();
