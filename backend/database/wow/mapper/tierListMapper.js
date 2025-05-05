let db;

async function insertTierList(params) {
  const { versionId, activityType, role, tierData, createdAt } = params;
  await db.run(
    `
    INSERT INTO wow_tier_list(version_id, activity_type, role, tier_data, created_at) VALUES (?1, ?2, ?3, ?4, ?5)
  `,
    [versionId, activityType, role, tierData, createdAt]
  );
}

async function updateTierList(params) {
  const { versionId, activityType, role, tierData, createdAt } = params;
  return db.run(
    `
    UPDATE 
      wow_tier_list
    SET 
      tier_data = ?,
      created_at = ?
    WHERE 
      version_id = ?
    AND
      activity_type = ?
    AND
      role = ?
      `,
    [
      typeof tierData === 'string' ? tierData : JSON.stringify(tierData),
      createdAt,
      versionId,
      activityType,
      role,
    ]
  );
}

function getTierListByVersion(params) {
  const { versionId, role, activityType } = params;
  return db.all(
    `SELECT 
      *
    FROM 
      wow_tier_list
    WHERE 
      version_id = ?1 AND role = ?2 AND activity_type = ?3
    ORDER BY
      created_at DESC
    `,
    [versionId, role, activityType]
  );
}

function getAllTierList() {
  return db.all(`SELECT version_id, activity_type, role FROM wow_tier_list`);
}

async function getSpec(classSpec, roleClass) {
  const list = await db.get(
    `SELECT * 
    FROM wow_tier_list 
    WHERE 
      INSTR(tier_data, '"classSpec":"' || ? || '"') > 0
      AND INSTR(tier_data, '"roleClass":"' || ? || '"') > 0;`,
    [classSpec, roleClass]
  );
  let output;
  if (list?.tier_data) {
    JSON.parse(list.tier_data).find((tier) => {
      const hasFound = tier.children.find((child) => {
        if (child.classSpec === classSpec && child.roleClass === roleClass) {
          output = {
            ...child,
            ...tier,
            id: undefined,
            children: undefined,
          };
          return true;
        }
        return false;
      });
      return hasFound;
    });
  }
  return output;
}

export function useTierListMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    insertTierList,
    getSpec,
    getTierListByVersion,
    getAllTierList,
    updateTierList,
  };
}
