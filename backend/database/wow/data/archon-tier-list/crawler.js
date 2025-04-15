import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { useCheerioContext } from '../../../../util/run-browser.js';
import classLocale from '../../../../util/classLocale.js';
import { formatDate } from '../../../../util/time.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getStaticFilePath() {
  return path.resolve(__dirname, './cache/mythic.html');
}
function getUrl() {
  return 'https://www.archon.gg/wow';
}

async function collectMythicTierList() {
  const $ = await useCheerioContext(getStaticFilePath(), getUrl(), true);
  const dpsTier = [];
  const tankTier = [];
  const healerTier = [];
  $('.builds-tier-list-section__tiers')
    .children()
    .each((tierIdx, rowEle) => {
      const tier = $(rowEle).children().first().text();
      const tierItem = {
        tier,
        children: [],
      };

      $(rowEle)
        .children('ul')
        .each((roleIdx, roleEle) => {
          $(roleEle)
            .children('li')
            .each((specIdx, specEle) => {
              let [classSpec, roleClass] = $(specEle)
                .attr('title')
                .toLowerCase()
                .split(' ');
              if (classSpec === 'beast') {
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

          if (roleIdx === 0) {
            dpsTier.push(tierItem);
          } else if (roleIdx === 1) {
            tankTier.push(tierItem);
          } else if (roleIdx === 2) {
            healerTier.push(tierItem);
          }
        });
    });
  const basic = {
    // TODO 默认返回昨天的时间，archon是每日更新 ？
    createdAt: formatDate(Date.now() - 24 * 60 * 60 * 1000),
    versionId: '11.1',
    activityType: 'MYTHIC',
  };
  return {
    dpsTier: {
      ...basic,
      tierData: dpsTier,
    },
    tankTier: {
      ...basic,
      tierData: tankTier,
    },
    healerTier: {
      ...basic,
      tierData: healerTier,
    },
  };
}

collectMythicTierList();
