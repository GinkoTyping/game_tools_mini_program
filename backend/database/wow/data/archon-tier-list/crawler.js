import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { useCheerioContext } from '../../../../util/run-browser.js';
import classLocale from '../../../../util/classLocale.js';
import { formatDate } from '../../../../util/time.js';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getStaticFilePath() {
  return path.resolve(__dirname, './cache/mythic.html');
}

function getUrl() {
  return 'https://www.archon.gg/wow';
}

export async function collectMythicTierList() {
  const useCache = false;
  const $ = await useCheerioContext(getStaticFilePath(), getUrl(), useCache);
  const dpsTier = [];
  const tankTier = [];
  const healerTier = [];

  let tier = 'S';
  $('.builds-tier-list-section__tiers')
    .children()
    .each((tierIdx, rowEle) => {

      if (tierIdx === 0 || tierIdx % 4 === 0) {
        tier = $(rowEle).children().first().text()?.split(' ')[0];
      } else {
        const tierItem = {
          tier,
          children: [],
        };

        $(rowEle)
          .children('li')
          .each((specIdx, specEle) => {
            let [classSpec, roleClass] = $(specEle)
              .attr('title')
              .toLowerCase()
              .split(' ');
            if (classSpec === 'beastmastery') {
              classSpec = 'beast-mastery';
              roleClass = 'hunter';
            } else if (roleClass === 'deathknight') {
              roleClass = 'death-knight';
            } else if (roleClass === 'demonhunter') {
              roleClass = 'demon-hunter';
            }

            tierItem.children.push({
              roleClass,
              classSpec,
              fullNameEN: `${classSpec} ${roleClass}`,
              fullNameZH: `${classLocale[roleClass][classSpec]} ${classLocale.class[roleClass]}`,
            });
          });

        if (tierIdx % 4 === 1) {
          dpsTier.push(tierItem);
        } else if (tierIdx % 4 === 2) {
          tankTier.push(tierItem);
        } else if (tierIdx % 4 === 3) {
          healerTier.push(tierItem);
        }
      }
    });
  const basic = {
    // TODO 默认返回昨天的时间，archon是每日更新 ？
    createdAt: formatDate(Date.now() - 24 * 60 * 60 * 1000),
    versionId: '12.0',
    activityType: 'MYTHIC',
  };
  return [
    {
      ...basic,
      role: 'DPS',
      tierData: dpsTier,
    },
    {
      ...basic,
      role: 'TANK',
      tierData: tankTier,
    },
    {
      ...basic,
      role: 'HEALER',
      tierData: healerTier,
    },
  ];
}

export async function collectMythicTierListV2(params) {
  const types = ['dps', 'tank', 'healer'];
  const { hash } = params ?? {};
  const basic = {
    // TODO 默认返回昨天的时间，archon是每日更新 ？
    createdAt: formatDate(Date.now() - 24 * 60 * 60 * 1000),
    versionId: '12.0',
    activityType: 'MYTHIC',
  };

  const results = await Promise.allSettled(types.map(async type => {
    const url = `https://www.archon.gg/_next/data/${hash}/wow/tier-list/${type}-rankings/mythic-plus/10/all-dungeons/this-week.json?gameSlug=wow&rankingsSlug=dps-rankings&zoneTypeSlug=mythic-plus&difficultySlug=10&encounterSlug=all-dungeons&affixesSlug=this-week`;
    const res = await axios.get(url);
    const tierData = res?.data?.pageProps?.page?.specTierListSection?.tierLists?.[0]?.tiers?.map(tierItem => ({
      tier: tierItem.tier,
      children: tierItem?.entries?.[0]?.map(item => {
        let roleClass = item.name.split(' ').pop()?.toLowerCase();
        let classSpec = item.name.split(' ').shift()?.toLowerCase();

        if (classSpec === 'beastmastery') {
          classSpec = 'beast-mastery';
          roleClass = 'hunter';
        } else if (roleClass === 'deathknight') {
          roleClass = 'death-knight';
        } else if (roleClass === 'demonhunter') {
          roleClass = 'demon-hunter';
        }

        return {
          roleClass,
          classSpec,
          fullNameEN: `${classSpec} ${roleClass}`,
          fullNameZH: `${classLocale[roleClass][classSpec]} ${classLocale.class[roleClass]}`,
          value: item.value,
        };
      }),
    }));
    const lastUpdated = res?.data?.pageProps?.page.lastUpdated;
    return {
      versionId: '12.0',
      activityType: 'MYTHIC',
      createdAt: lastUpdated ? formatDate(new Date(lastUpdated).getTime()) : formatDate(Date.now() - 24 * 60 * 60 * 1000),
      role: type.toUpperCase(),
      tierData,
    };
  }));

  return results.map(item => item.value);
}