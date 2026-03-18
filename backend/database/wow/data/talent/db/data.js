import pLimit from 'p-limit';

import { getDB } from '../../../../utils/index.js';
import setBlizzAPI from '../../../../../util/blizz.js';
import { usePlayableRoleMapper } from '../../../mapper/static/playableRoleMapper.js';
import { useTalentMapper } from '../../../mapper/static/talentMapper.js';
import talentTreeIndexData from './talent-tree-index.js';

const db = await getDB();
const blizzAPI = setBlizzAPI();
const playableRoleMapper = usePlayableRoleMapper(db);
const talentMapper = useTalentMapper(db);

async function getTalentTreeList() {
  try {
    // const data = await blizzAPI.query('/data/wow/talent-tree/index', {
    //   params: {
    //     namespace: 'static-us',
    //     locale: 'en_US',
    //   },
    // });
    const data = talentTreeIndexData;
    const list = [];

    async function collectEmptyTalentSpec(item) {
      // const isExisted = await talentMapper.getTalentDev(item.name);
      // if (!isExisted || item.name === 'Holy') {
      //   list.push({
      //     url: item.key.href,
      //     name: item.name.toLowerCase().replace(/\s/g, '-'),
      //   });
      // }

      list.push({
        url: item.key.href,
        name: item.name.toLowerCase().replace(/\s/g, '-'),
      });
    }

    await Promise.allSettled(data.spec_talent_trees.map(item => collectEmptyTalentSpec(item)));
    console.log('开始收集专精个数', list.length);
    return list;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function addTalentBySpec(spec) {
  try {
    const urlItem = new URL(spec.url);
    const talentData = await blizzAPI.query(urlItem.pathname, {
      params: {
        namespace: 'static-us',
        locale: 'zh_CN',
      },
    });

    const specDetail = await playableRoleMapper.getSpecById(talentData.playable_specialization.id);

    const result = await talentMapper.addTalent({
      ...talentData,
      url: spec.url,
      role_class: specDetail.class_name_en,
      class_spec: specDetail.spec_name_en,
    });
    if (result.changes) {
      console.log(`成功：`, specDetail.class_name_en, specDetail.spec_name_en);
    }
    return result;
  } catch (e) {
    console.log(`失败：`, spec.name, spec.url);
    throw new Error(e.message);
  }
}

const limit = pLimit(1);

async function main() {
  const list = await getTalentTreeList();
  const results = await Promise.allSettled(list.map((item) => limit(() => addTalentBySpec(item))));
  console.log(results);
  console.log('失败次数', results.filter((item) => item.status !== 'fulfilled')?.length);
}

main();