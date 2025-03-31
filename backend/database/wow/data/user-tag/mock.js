import { getDynamicDB } from '../../../utils/index.js';

import commonTag from './common_tag.js';
import wowTag from './wow_tag.js';
import specOptions from './spec-option.js';
import { formatDateByMinute } from '../../../../util/time.js';

// 辅助函数：随机选择数组元素
const randomSelect = (arr, max = 3) => {
  const count = Math.floor(Math.random() * max) + 1;
  return [...new Set(arr)].sort(() => Math.random() - 0.5).slice(0, count);
};

// 生成战网ID
const generateBattlenetId = () => {
  return Math.random() > 0.2
    ? `TEST#${Math.floor(1000 + Math.random() * 9000)}`
    : 'NULL';
};

// 生成活跃时间段数据
const generateActiveTime = () => {
  const generateTimeValues = () =>
    Array.from({ length: 24 }, (_, i) => ({
      text: `${i}:00`,
      value: i,
      selected: Math.random() > 0.8,
    }));

  return [
    { title: '工作日', values: generateTimeValues() },
    { title: '休息日', values: generateTimeValues() },
  ];
};

// 生成wow_tag字段
const generateWowTag = () => {
  const server = randomSelect(wowTag.server.options, 1);
  const jobs = randomSelect(wowTag.jobs.options, 3);
  const classes = randomSelect(wowTag.classes.options, 3);
  const spec = randomSelect(specOptions, 1);
  const communication = randomSelect(wowTag.communication.options, 3);


  return {
    jobs: jobs.map((job) => ({ text: job.text, value: job.value })),
    server: server.map((item) => ({ text: item.text, value: item.value })),
    communication: communication.map((item) => ({ text: item.text, value: item.value })),
    spec: spec.map((s) => ({
      text: s.text,
      value: s.value,
      roleClass: s.roleClass,
      classSpec: s.classSpec,
    })),
    classes: classes.map((cls) => ({ text: cls.text, value: cls.value })),
    gameStyle: randomSelect(wowTag.gameStyle.options).map((gs) => ({
      text: gs.text,
      value: gs.value,
    })),
    activeTime: generateActiveTime(),
    privacy: { needConfirm: true },
  };
};

// 生成时间数据
function generateRandomDate() {
  const nowTime = Date.now();
  const ramdonTime = Math.floor(Math.random() * 3600 * 1000 - 2 * 3600 * 1000);
  return formatDateByMinute(nowTime + ramdonTime);
}

// 生成common_tag字段
const generateCommonTag = () => ({
  status: randomSelect(commonTag.status.options, 3).map((item) => ({
    text: item,
    value: item,
  })),
  age: randomSelect(commonTag.age.options, 1).map((item) => ({
    text: item,
    value: item,
  })),
  game: randomSelect(commonTag.game.options, 3).map((item) => ({
    text: item,
    value: item,
  })),
  personality: randomSelect(commonTag.personality.options, 2).map((item) => ({
    text: item,
    value: item,
  })),
  role: randomSelect(commonTag.role.options, 3).map((item) => ({
    text: item,
    value: item,
  })),
});

// 生成单条记录
const generateRecord = (id) => {
  const wowTagData = generateWowTag();
  const commonTagData = generateCommonTag();

  return {
    id: id.toString(),
    user_id: id,
    created_at: generateRandomDate(),
    updated_at: generateRandomDate(),
    battlenet_id: generateBattlenetId(),
    wow_tag: JSON.stringify(wowTagData).replace(/'/g, "''"),
    common_tag: JSON.stringify(commonTagData).replace(/'/g, "''"),
    wow_jobs: wowTagData.jobs.map((j) => j.value).join(','),
    wow_server: wowTagData.server.map((j) => j.value).join(','),
    wow_communication: wowTagData.communication.map((j) => j.value).join(','),
    wow_spec: wowTagData.spec.map((s) => s.value).join(','),
    wow_classes: wowTagData.classes.map((c) => c.value).join(','),
    wow_game_style: wowTagData.gameStyle.map((gs) => gs.value).join(','),
    wow_active_time: wowTagData.activeTime
      .map((day) =>
        day.values
          .filter((t) => t.selected)
          .map((t) => t.value)
          .join('|')
      )
      .filter((str) => str) // 过滤空值
      .join(','), // 改为逗号分隔
    wow_privacy: Math.floor(Math.random() * 2),
    common_status: commonTagData.status.map((j) => j.value).join(','),
    common_game: commonTagData.game.map((j) => j.value).join(','),
    common_age: commonTagData.age.map((j) => j.value).join(','),
    common_personality: commonTagData.personality.map((j) => j.value).join(','),
    common_role: commonTagData.role.map((j) => j.value).join(','),
  };
};

// 生成SQL插入语句
const generateSQL = (count = 10) => {
  const records = Array.from({ length: count }, (_, i) =>
    generateRecord(i + 1)
  );

  const columns = Object.keys(records[0]).join(', ');
  const values = records
    .map(
      (record) =>
        `(${Object.values(record)
          .map((v) =>
            typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v
          )
          .join(', ')})`
    )
    .join(',\n');

  return `
INSERT INTO wow_dynamic_user_tag 
(${columns})
VALUES
${values};
`;
};

// 生成10条测试数据
async function main() {
  const db = await getDynamicDB();
  await db.run(`DELETE FROM wow_dynamic_user_tag `);
  const sql = generateSQL(50);
  await db.run(sql);
}

main();
