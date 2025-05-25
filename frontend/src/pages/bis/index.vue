<template>
  <template v-if="activeMenu === 'index'">
    <uni-section
      id="overview"
      :class="[classKey]"
      title="总览"
      :sub-title="`上次更新：${currentData?.updatedAt}`"
    >
      <uni-card class="section-card">
        <view
          class="rating-item"
          v-for="item in currentData?.ratings"
          :key="item.label"
        >
          <view class="label">
            <text>{{ item.label }}</text>
            <text class="sub-label">({{ item.comment }})</text>
          </view>
          <view class="bars">
            <view
              :class="['bar', getBarColor(item.ratingScore, bar)]"
              v-for="(bar, index) in item.rating"
              :key="index"
            >
            </view>
          </view>
        </view>
      </uni-card>

      <uni-card class="section-card tiers-card">
        <view class="tiers">
          <view
            class="tier-bar"
            @click="
              () =>
                navigator.toTierList({
                  version_id: '11.1',
                  activity_type: 'MYTHIC',
                  role: 'dps',
                })
            "
          >
            <view class="tier-prefix">
              <view
                class="tier-icon"
                :class="[`${currentData?.mythicOverallTier?.tier}-tier`]"
              >{{ currentData?.mythicOverallTier?.tier }}
              </view
              >
              <view class="tier-text">大秘境 综合排行</view>
            </view>
            <view class="tier-suffix">
              <view>更多</view>
              <view class="iconfont icon-more"></view>
            </view>
          </view>

          <view class="tier-bar" @click="() => navigator.toSpecPopularity()">
            <view class="tier-prefix">
              <view
                class="tier-icon"
                :class="[`${currentData?.mythicDpsTier?.tier}-tier`]"
              >{{ currentData?.mythicDpsTier?.tier }}
              </view
              >
              <view class="tier-text">
                <view>大秘境 输出排行</view>
                <view class="tier-text__diff">{{
                    getDiffText(currentData?.mythicDpsTier?.diff)
                  }}
                </view>
              </view>
            </view>
            <view class="tier-suffix">
              <view>更多</view>
              <view class="iconfont icon-more"></view>
            </view>
          </view>
        </view>
      </uni-card>

      <uni-card class="section-card" v-show="statSource === 'wowhead'">
        <view class="menu stat-menu">
          <text
            v-for="(type, index) in currentData?.detailedStatsPriority?.best"
            :key="type.name"
            class="ellipsis"
            @click="() => switchStatType(index)"
            :class="[classKey, currentStatType === index ? 'menu_active' : '']"
          >{{ type.name }}
          </text
          >
        </view>
        <view class="stats" style="margin: 1rem 0">
          <template
            v-for="(statText, index) in currentStatList"
            :key="statText"
          >
            <text>{{ statText }}</text>
            <image
              v-show="index !== currentStatList.length - 1"
              src="/static/icon/dayu.svg"
            />
          </template>
        </view>
        <uni-collapse ref="statDetailCollapse">
          <uni-collapse-item
            title="属性说明 (可点击技能)"
            :open="currentData?.detailedStatsPriority"
          >
            <view
              class="stat-info"
              v-for="(info, index) in currentData?.detailedStatsPriority
                ?.overview"
              :key="index"
            >
              <rich-text
                :nodes="renderTip(info.text)"
                @click="() => displaySpells(info.spells)"
              ></rich-text>
            </view>
          </uni-collapse-item>
        </uni-collapse>
      </uni-card>

      <uni-card class="section-card" v-show="statSource === 'maxroll'">
        <view class="stats-info">
          基于前
          <text> 5%</text>
          高层大秘境 样本数:
          <text>{{ currentData?.archonStatsPriority?.sampleCount }}</text>
        </view>
        <view class="stats">
          <view class="stats__item">
            <view :style="{ color: getStatLabel(0).color }">
              <text>{{
                  getStatRatio(0)
                }}
              </text>
              <text>{{
                  getStatLabel(0).label
                }}
              </text>
            </view>

            <text>{{
                getStatValue(0)
              }}
            </text>

          </view>
          <image
            v-if="currentData?.archonStatsPriority.relations.length"
            :src="`/static/icon/${relationIcon(
              currentData?.archonStatsPriority.relations[0]
            )}.svg`"
          ></image>
          <view class="stats__item">
            <view :style="{ color: getStatLabel(1).color }">
              <text>{{
                  getStatRatio(1)
                }}
              </text>
              <text>{{
                  getStatLabel(1).label
                }}
              </text>
            </view>
            <text>{{
                getStatValue(1)
              }}
            </text>
          </view>
          <image
            v-if="currentData?.archonStatsPriority.relations.length"
            :src="`/static/icon/${relationIcon(
              currentData?.archonStatsPriority.relations[1]
            )}.svg`"
          ></image>
          <view class="stats__item">
            <view :style="{ color: getStatLabel(2).color }">
              <text>{{
                  getStatRatio(2)
                }}
              </text>
              <text>{{
                  getStatLabel(2).label
                }}
              </text>
            </view>
            <text>{{
                getStatValue(2)
              }}
            </text>
          </view>
          <image
            v-if="currentData?.archonStatsPriority.relations.length"
            :src="`/static/icon/${relationIcon(
              currentData?.archonStatsPriority.relations[2]
            )}.svg`"
          ></image>
          <view class="stats__item">
            <view :style="{ color: getStatLabel(3).color }">
              <text>{{
                  getStatRatio(3)
                }}
              </text>
              <text>{{
                  getStatLabel(3).label
                }}
              </text>
            </view>
            <text>{{
                getStatValue(3)
              }}
            </text>
          </view>
        </view>
        <view class="stats-charts">
          <view class="chart-item"
            v-for="(item, index) in currentData?.archonStatsPriority?.priority"
            :key="index"
            :style="{ borderTopColor: getStatLabel(index).color }">
            <view class="chart-item__bar"
              v-for="bar in item.data"
              :key="bar.sampleCount"
              :style="{ height: bar.percentage, backgroundColor: getStatLabel(index).color }"></view>
          </view>
        </view>
      </uni-card>
    </uni-section>
  </template>

  <template v-if="activeMenu === 'talent'">
    <uni-section class="talent" :class="[classKey]" title="天赋">
      <TalentTree v-model="talentData.class_talent_nodes" />
      <uni-card class="section-card">
        <view class="menu talent-menu">
          <text
            v-for="(item, index) in currentData?.talents"
            :key="item.talent"
            class="ellipsis"
            @click="() => switchTalent(index)"
            :class="[
              classKey,
              currentTalentIndex === index ? 'menu_active' : '',
            ]"
          >{{ item.talent }}
          </text
          >
        </view>
        <view class="talent-export" @click="exportTalentCode">
          <text class="talent-export__title"
          >当前：{{ currentData?.talents[currentTalentIndex]?.talent }}
          </text
          >
          <view>
            <uni-icons
              type="download-filled"
              color="#007aff"
              size="30"
            ></uni-icons>
            <text>复制代码</text>
          </view>
        </view>

        <uni-collapse ref="collapse">
          <uni-collapse-item
            v-for="(url, index) in currentData?.talents[currentTalentIndex]
              ?.url"
            :key="index"
            :open="isTalentImageLoad && index === 2"
          >
            <template v-slot:title>
              <uni-list>
                <uni-list-item
                  class="dungeon_tip-title"
                  :title="getTalentType(index)"
                  rightText="点击任意位置"
                >
                </uni-list-item>
              </uni-list>
            </template>
            <image
              class="talent-image"
              mode="widthFix"
              lazy-load
              :src="getTalentImage(url)"
              @load="() => onImageLoad(currentTalentIndex, index)"
              @click="() => preiviewImage(index)"
            />
          </uni-collapse-item>
        </uni-collapse>
      </uni-card>
    </uni-section>
  </template>

  <template v-if="activeMenu === 'bis'">
    <ExportCanvas
      ref="exportRef"
      target-selector="#bis-table"
      :data="{
        bisLabel: currentTableName,
        bisItems: tableData,
        title: query.title,
        roleClass: query.classKey,
        classSpec: query.specKey
      }"
      :config="{ backgroundColor: '#f0f0f0', debug: false }"
      @success="handleSuccess"
      @error="handleError"
    />

    <uni-section class="bis" :class="[classKey]" title="BIS配装">
      <uni-card class="section-card">
        <view class="menu-container">
          <view class="menu">
            <text
              v-for="bis in currentData?.bisItems"
              :key="bis.title"
              @click="() => switchBisTable(bis.title)"
              :class="[
                classKey,
                currentTableName === bis.title ? 'menu_active' : '',
              ]"
            >{{ bis.title }}
            </text
            >
          </view>
          <view
            class="to-enhancement"
            @click="exportImage"
          >
            <text>{{ isExporting ? '生成中...' : '保存' }}</text>
            <uni-icons v-show="!isExporting" type="download-filled" color="#007aff" size="20"></uni-icons>
          </view>
        </view>
        <view id="bis-table">
          <uni-table ref="table" stripe emptyText="暂无更多数据">
            <uni-tr>
              <uni-th width="42" align="left">部位</uni-th>
              <uni-th align="left">
                <view class="custom-header-item">
                  <text>装备</text>
                  <view
                    class="custom-header-item__button"
                    @click="displayEnhancement = !displayEnhancement"
                  >
                    <image
                      src="https://ginkolearn.cyou/api/wow/assets/blizz-media-image/inv_misc_enchantedscroll.jpg"
                    />
                    <text>{{ switchEnhancementText }}</text>
                  </view>
                </view>
              </uni-th>
              <uni-th width="100" align="left">来源</uni-th>
            </uni-tr>
            <uni-tr v-for="(item, index) in tableData" :key="index">
              <uni-td>{{ item.slot }}</uni-td>
              <uni-td>
                <view class="slot-container">
                  <view class="slot-container__item">
                    <img
                      :src="currentThumbImageSrc(item)"
                      alt=""
                      srcset=""
                      style="width: 14px; height: 14px"
                    />
                    <view
                      class="ellipsis"
                      style="flex: 1"
                      :class="[item.wrap ? 'disale-ellipsis' : '']"
                      @click="
                      () => {
                        switchDetail(true, item);
                        switchWrap(item);
                      }
                    "
                    >{{ item.name }}
                    </view
                    >
                  </view>
                  <template v-if="displayEnhancement">
                    <view
                      class="slot-container__enhancement"
                      v-for="enhancement in item.enhancements"
                      :key="enhancement.id"
                    >
                      <img
                        :src="currentThumbImageSrc(enhancement)"
                        style="width: 14px; height: 14px"
                      />
                      <view
                        class="ellipsis"
                        style="flex: 1"
                        :class="[item.wrap ? 'disale-ellipsis' : '']"
                        @click="
                        () => {
                          switchDetail(true, enhancement, 'item');
                          switchWrap(item);
                        }
                      "
                      >{{ enhancement.name }}
                      </view
                      >
                    </view>
                  </template>
                </view>
              </uni-td>
              <uni-td>
                <view
                  class="ellipsis bis-item"
                  :class="[
                  item.wrap ? 'disale-ellipsis' : '',
                  item.source?.isLoot ? 'is-loot' : '',
                ]"
                  @click="() => switchWrap(item)"
                >{{ item.source?.source }}
                </view
                >
              </uni-td>
            </uni-tr>
          </uni-table>
        </view>

      </uni-card>
    </uni-section>

    <uni-section class="trinkets" :class="[classKey]" title="饰品">

      <uni-card class="section-card">
        <uni-segmented-control
          :class="[classKey]"
          :current="currentTrinketTab"
          :values="trinketTabs"
          style-type="text"
          @clickItem="switchTrinketTab"
        />
        <template v-if="currentTrinketTab === 0">
          <view
            class="tier"
            v-for="(tier, index) in currentData?.trinkets"
            :key="tier.label"
          >
            <view class="tier-label" :data-label="index">
              <text>{{ tier.label }}</text>
            </view>
            <view class="trink-container">
              <view
                class="trink"
                v-for="trinket in tier.trinkets"
                :key="trinket.image"
              >
                <img
                  @click="() => switchDetail(true, trinket)"
                  :src="currentImageSrc(trinket)"
                  alt=""
                  srcset=""
                />
              </view>
            </view>
          </view>
        </template>
        <view class="popular-trinkets" v-if="currentTrinketTab === 1">
          <view
            class="popular-trinkets__item"
            v-for="item in currentData?.popularMythicDungeonTrinkets"
            :key="item.id"
          >
            <view
              class="popular-trinkets__item-left"
              @click="() => switchDetail(true, item)"
            >
              <image
                class="popular-trinkets__item-left__icon"
                :src="currentImageSrc(item)"
                mode="widthFix"
              />
              <view class="popular-trinkets__item-left__name">{{
                  item.name
                }}
              </view>
            </view>
            <view class="popular-trinkets__item-right">
              <text class="popular-trinkets__item-right__max-key">{{ item.maxKey }}</text>
              <text class="popular-trinkets__item-right__dps">{{ getTrinketDps(item.dps) }}</text>
              <text class="popular-trinkets__item-right__popularity">{{
                  item.popularity
                }}
              </text>
            </view>
          </view>
        </view>
      </uni-card>
    </uni-section>

    <uni-section class="corruptions"
      id="corruptions"
      :class="[classKey]"
      title="腐蚀"
      :sub-title="`更新于: ${currentData?.wowheadBis?.updatedAt}`">
      <uni-card class="section-card">
        <rich-text
          :nodes="renderTip(currentData?.wowheadBis?.corruptions?.title, '#fff', 'rgb(163, 53, 238)')"
          @click="() => displaySpells(currentData?.wowheadBis?.corruptions?.items)"
        ></rich-text>

        <view
          class="advice-item"
          style="margin-top: 20rpx"
          v-for="(item) in getDisplayCorruptions"
          :key="item.id"
        >
          <view class="data-item" @click="() => switchDetail(true, item)">
            <image :src="currentImageSrc(item)" mode="widthFix" />
            <view
              class="advice-item__name"
              :class="[item.included ? 'advice-item__name--heroic' : 'advice-item__name--faded']"
            >{{ item.name
              }}
            </view>
          </view>
        </view>

        <text @click="isShowAllCorruptions = !isShowAllCorruptions">{{ switchCorruptionText }}</text>
      </uni-card>

    </uni-section>

    <uni-section
      id="puzzling-cartel-chip-advice"
      :class="[classKey]"
      title="团本兑换代币"
      :sub-title="`更新于: ${currentData?.wowheadBis?.updatedAt}`"
    >
      <uni-card class="section-card">
        <view class="advice-text">
          <image
            src="https://ginkolearn.cyou/api/wow/assets/blizz-media-image/inv_misc_curiouscoin.jpg"
            mode="widthFix"
          />
          <view class="druid">令人费解的财阀凭证</view>
          <view>兑换优先级推荐</view>
        </view>

        <uni-segmented-control
          v-if="chipAdviceTabs?.length > 1"
          :class="[classKey]"
          :current="currentChipAdviceTab"
          :values="chipAdviceTabs"
          style-type="text"
          @clickItem="switchChipAdviceTab"
        />
        <view
          class="advice-item"
          v-for="(item, index) in displayAdviceData?.list"
          :class="[isSamePriorityChipItem(item, index) ? 'advice-item--same-priority' :'']"
          :key="item.id"
        >
          <view class="data-item">
            <image :src="currentImageSrc(item)" mode="widthFix" />
            <text class="advice-item__name" :class="[getItemRarityClass(item.rarity)]">{{ getItemRarityName(item.rarity)
              }}
            </text>
            <view class="advice-item__name"
              :class="[getItemRarityClass(item.rarity)]"
              @click="() => switchDetail(true, item)">{{ item.name }}
            </view>
            <view class="advice-item__more" v-if="item.info" @click="item.showInfo = !item.showInfo">
              <text class="iconfont icon-weidu-01"></text>
              <text class="">{{ item.showInfo ? '隐藏解释' : '查看解释' }}</text>
            </view>
          </view>
          <view class="data-info" v-show="item.showInfo">{{ item.info }}</view>
        </view>

        <text class="overall-info">{{ displayAdviceData?.info }}</text>
      </uni-card>
    </uni-section>
  </template>

  <template v-if="activeMenu === 'mythic'">
    <uni-section class="dungeon" :class="[classKey]" title="一句话大秘境">
      <uni-card class="section-card">
        <view class="menu">
          <text
            v-for="dungeon in dungeons"
            :key="dungeon.id"
            @click="() => switchDungeon(dungeon.id)"
            :class="[
              'ellipsis',
              classKey,
              currentDungeonId === dungeon.id ? 'menu_active' : '',
            ]"
          >{{ dungeon.name_zh }}
          </text
          >
        </view>
        <view class="dungeon_empty" v-show="tipMessage?.length">{{
            tipMessage
          }}
        </view>
        <uni-collapse ref="dungeonCollapse" v-model="tipCollapseIndex">
          <uni-collapse-item
            v-for="(tipKind, index) in dungeonTip?.children"
            :key="tipKind.title"
            :open="index === 0"
          >
            <template v-slot:title>
              <uni-list>
                <uni-list-item
                  class="dungeon_tip-title"
                  :title="tipKind.title"
                  rightText="点击任意位置"
                >
                </uni-list-item>
              </uni-list>
            </template>
            <view
              class="ul"
              v-for="(l1Child, l1Index) in tipKind.children"
              :key="l1Index"
            >
              <text v-if="l1Child.children.length">{{
                  l1Child.title || l1Child.totalText
                }}
              </text>
              <rich-text
                v-if="!l1Child.children.length"
                :nodes="renderTip(l1Child.title || l1Child.totalText)"
              ></rich-text>
              <view
                class="li list-style"
                v-for="(l2Child, l2Index) in l1Child.children"
                :key="l2Index"
              >
                <rich-text
                  :nodes="renderTip(l2Child.totalText)"
                  @click="() => displaySpells(l2Child.spells)"
                ></rich-text>
                <view
                  class="ul list-style-empty"
                  v-show="l2Child.children?.length"
                  v-for="(l3Child, l3Index) in l2Child.children"
                  :key="l3Index"
                >
                  <rich-text
                    :nodes="renderTip(l3Child.totalText)"
                    @click="() => displaySpells(l3Child.spells)"
                  ></rich-text>
                  <view
                    class="li list-style-empty"
                    v-show="l3Child.children?.length"
                    v-for="(l4Child, l4Index) in l3Child.children"
                    :key="l4Index"
                  >
                    <rich-text
                      :nodes="renderTip(l4Child.totalText)"
                      @click="() => displaySpells(l4Child.spells)"
                    ></rich-text>
                    <view
                      class="ul list-style-empty"
                      v-show="l4Child.children?.length"
                      v-for="(l5Child, l5Index) in l4Child.children"
                      :key="l5Index"
                    >
                      <rich-text
                        :nodes="renderTip(l5Child.totalText)"
                        @click="() => displaySpells(l5Child.spells)"
                      ></rich-text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </uni-collapse-item>
        </uni-collapse>
      </uni-card>
    </uni-section>
  </template>

  <ad-custom unit-id="adunit-43dfd4fbca02d516" class="ad-container"></ad-custom>

  <view class="footer"></view>

  <SpecFooter
    v-model="activeMenu"
    :menus="footerMenus"
    @change="onMenuChange"
  />

  <uni-popup ref="popup">
    <ItemPopover
      :status="status"
      :itemDetail="currentDetails"
      :image-src="currentImageSrc(currentItem)"
    />
  </uni-popup>

  <uni-popup ref="spellpopup">
    <uni-card
      class="previw-popup"
      v-for="spell in currentSpells"
      :key="spell.id"
    >
      <text class="spell-name">{{ spell.name_zh }}</text>
      <view class="spell-prop">
        <text
          v-show="spell?.range && !spell.range?.includes('0码')"
          style="width: 100%"
        >{{ spell.range }}
        </text
        >
        <text v-show="spell.cast_time?.length">{{ spell.cast_time }}</text>
        <text v-show="spell.cooldown?.length && spell.cooldown != 'n/a'">{{
            spell.cooldown
          }}
        </text>
        <text v-show="spell.cost && spell.cost != '无'">{{ spell.cost }}</text>
      </view>
      <text class="description">{{ spell.description }}</text>
    </uni-card>
  </uni-popup>

  <TopMessage
    ref="messagePopup"
    v-model:type="messageType"
    v-model:message="messageText"
  />
</template>

<script lang="ts" setup>
// TODO 新增对应专精的图片
import { onLoad } from '@dcloudio/uni-app';
import { onShareAppMessage } from '@dcloudio/uni-app';
import { computed, nextTick, ref } from 'vue';

import type { IBisItem } from '@/interface/IWow';
import { Relation } from '@/interface/IWow';
import { getImageSrc, type IDungeonDTO } from '@/api/wow';
import {
  queryBis,
  queryTalent,
  queryItemPreview,
  querySeasonDungeons,
  queryDungeonTip,
  querySpellsInTip,
} from '@/api/wow';
import TopMessage from '@/components/TopMessage.vue';
import SpecFooter from '@/components/SpecFooter.vue';
import ItemPopover from '@/components/ItemPopover.vue';
import { useNavigator } from '@/hooks/navigator';
import ExportCanvas from '@/components/ExportCanvas.vue';
import TalentTree from '@/components/TalentTree/index.vue';

const classKey = ref('');
const specKey = ref('');
const currentData = ref<any>();
const query = ref<any>({});
const navigator = useNavigator();

function checkJumpTo() {
  if (query.value?.menu) {
    activeMenu.value = query.value.menu;
    if (query.value?.scrollTo) {
      nextTick(() => {
        uni.pageScrollTo({
          selector: query.value?.scrollTo,
        });
      });
    }
  }

}

onLoad(async (options: any) => {
  query.value = options;
  classKey.value = options.classKey ?? 'death-knight';
  specKey.value = options.specKey ?? 'blood';

  uni.showLoading({
    title: '银子加载中...',
    mask: true,
  });

  // TODO 加载页面完成前，需要展示loading
  await getBasicBisData();

  uni.hideLoading();

  setNaviTitle(`${options.title} ${currentData.value.version}`);

  checkJumpTo();
});

async function getBasicBisData() {
  currentData.value = await queryBis(classKey.value, specKey.value);
  currentTableName.value = currentData.value.bisItems[0]?.title;
}

onShareAppMessage(() => {
  const {
    title,
    classKey,
    specKey,
  } = query.value;

  return {
    title: `${title}·属性配装和攻略`,
    path: `pages/bis/index?classKey=${classKey}&specKey=${specKey}&title=${title}`,
  };
});

//#region 评分
const getBarColor = computed(() => {
  return (score: number, cur: number) => {
    if (cur) {
      if (score > 3) {
        return 'green-bar';
      }
      if (score > 1) {
        return 'orange-bar';
      }
      return 'red-bar';
    } else {
      return '';
    }
  };
});
const getDiffText = computed(() => {
  return (diff: string) => {
    if (diff?.includes('↑') || diff?.includes('↓')) {
      return `(${diff}名)`;
    } else {
      return '';
    }
  };
});
//#endregion

//#region 属性优先级
const relationIcon = computed(() => {
  return (relation: Relation) => {
    if (relation === Relation.Equal) {
      return 'dengyu';
    } else if (relation === Relation.Greater) {
      return 'dayu';
    } else if (relation === Relation.Greate_Greater) {
      return 'yuandayu';
    } else if (relation === Relation.Greater_Or_Equal) {
      return 'dayudengyu';
    }
  };
});
const statSource = ref('maxroll');
const statDetailCollapse = ref();
const getStatValue = computed(() => (index: number) => {
  const value = currentData.value?.archonStatsPriority?.priority?.[index]?.value;
  return `${value}`;
});
const getStatRatio = computed(() => (index: number) => {
  const ratio = currentData.value?.archonStatsPriority?.priority?.[index]?.ratio;
  return ratio ? `${ratio}` : '';
});
const getStatLabel = computed(() => (index: number) => {
  const label = currentData.value?.archonStatsPriority?.priority?.[index]?.label;
  let color;
  switch (label) {
    case '急速':
      color = '#3db67a';
      break;
    case '暴击':
      color = '#bd2625';
      break;
    case '全能':
      color = '#3baaf2';
      break;
    case '精通':
      color = '#725cc2';
      break;
  }
  return { label, color };
});

// function switchStatSource() {
//   if (statSource.value === 'wowhead') {
//     statSource.value = 'maxroll';
//   } else {
//     statSource.value = 'wowhead';
//     nextTick(() => {
//       statDetailCollapse.value?.resize?.();
//     });
//   }
// }

const isTalentImageLoad = ref(false);

function onImageLoad(tablentIndex: number, index: number) {
  if (tablentIndex === 0 && index === 2) {
    isTalentImageLoad.value = true;
  }
}

const currentStatType = ref(0);
const currentStatList = computed(
  () =>
    currentData.value?.detailedStatsPriority?.best[currentStatType.value]
      .priorityList,
);

function switchStatType(type: number) {
  currentStatType.value = type;
}

//#endregion

//#region 天赋
const currentTalentIndex = ref(0);
const getTalentType = computed(() => {
  return (index: number) => {
    switch (index) {
      case 0:
        return '职业天赋';
      case 1:
        return '英雄天赋';
      case 2:
        return '专精天赋';
      default:
        break;
    }
  };
});

function switchTalent(index: number) {
  if (currentTalentIndex.value !== index) {
    currentTalentIndex.value = index;
  }
}

function exportTalentCode() {
  uni.setClipboardData({
    data: currentData.value.talents[currentTalentIndex.value].code,
    success: function() {
      messageType.value = 'success';
      messageText.value = '已成功复制天赋代码到粘贴板。';
      messagePopup.value.open();
    },
  });
}

function getTalentImage(url: string) {
  return `https://ginkolearn.cyou/api/wow/assets/talent/${url}`;
}

function preiviewImage(imageIndex: number) {
  const urls = currentData.value.talents[currentTalentIndex.value].url.map(
    (item: string) => getTalentImage(item),
  );
  uni.previewImage({
    urls: urls,
    current: imageIndex,
    indicator: 'number',
    loop: true,
  });
}

const currentTableName = ref('');
const tableData = computed(() => {
  return currentData.value?.bisItems.find(
    item => item.title === currentTableName.value,
  )?.items;
});

function switchBisTable(tableName: string) {
  if (currentTableName.value !== tableName) {
    currentTableName.value = tableName;
  }
}

function setNaviTitle(title: string) {
  uni.setNavigationBarTitle({ title: title });
}

function switchWrap(item: IBisItem) {
  item.wrap = !item.wrap;
}

const displayEnhancement = ref(true);
const switchEnhancementText = computed(() =>
  displayEnhancement.value ? '隐藏' : '显示',
);

const popup = ref<any>('');
const currentDetails = ref<any>({});
const status = ref('loading');
const currentItem = ref<
  IBisItem | { image: string; id: number; source?: string; type?: string }
>();
const messagePopup = ref();
const messageType = ref('success');
const messageText = ref('默认文本');
const currentThumbImageSrc = computed(() => {
  return (item: any) => getImageSrc(item.image).thumbItem;
});
const currentImageSrc = computed(() => {
  return (item: any) => {
    if (item?.type === 'spell') {
      return `https://ginkolearn.cyou/api/wow/assets/spellIcon/${item.image}`;
    }
    if (item?.image) {
      return `https://ginkolearn.cyou/api/wow/assets/blizz-media-image/${item?.image}`;
    }
    return '';
  };
});

async function switchDetail(
  isShow: boolean,
  item: { image: string; id: number; type: string },
  forceType?: string,
) {
  if (item.type === 'spell') {
    displaySpells([item]);
  } else {
    currentDetails.value = {};
    if (isShow) {
      status.value = 'loading';
      popup.value.open();

      currentItem.value = item;
      if (forceType) {
        currentItem.value.type = forceType;
      }
      const {
        data,
        statusCode,
      } = await queryItemPreview(item.id);
      if (statusCode === 200) {
        currentDetails.value = data;
        status.value = '';
      } else {
        messageType.value = 'error';
        messageText.value = data.message;
        messagePopup.value.open();
        popup.value.close();
      }
    }
  }
}

//#endregion

//#region BIS配装
const exportRef = ref();
const isExporting = ref(false);
const exportImage = async () => {
  try {
    isExporting.value = true;
    await exportRef.value.exportToImage();
  } catch (err: any) {
    await uni.showToast({ title: err.message, icon: 'none' });
  } finally {
    isExporting.value = false;
  }
};

const handleSuccess = () => {
  uni.showToast({ title: '长按可保存', icon: 'none', duration: 5000 });
};

const handleError = (err) => {
  console.error('导出错误:', err?.message);
};

const currentChipAdviceTab = ref(0);

const chipAdviceTabs = computed(() => {
  return currentData.value?.wowheadBis?.detailedPuzzlingCartelChipAdvice?.map(item => item.typeName);
});
const displayAdviceData = computed(() => {
  const found = currentData.value?.wowheadBis?.detailedPuzzlingCartelChipAdvice?.[currentChipAdviceTab.value];
  return {
    info: found?.info,
    list: found?.data?.options ?? [],
  };
});
const getItemRarityClass = computed(() => (rarity: string) => {
  return rarity === 'heroic' ? 'advice-item__name--heroic' : 'advice-item__name--mythic';
});
const getItemRarityName = computed(() => (rarity: string) => rarity?.[0]?.toUpperCase());
const isSamePriorityChipItem = computed(() => {
  return (item, index) => {
    if (index === 0) {
      return false;
    }
    const isSameIndex = item.index === displayAdviceData.value.list[index - 1].index;
    const isFirstIndex = displayAdviceData.value.list.findIndex(child => child.index === index) === index;
    return !isFirstIndex && isSameIndex;
  };
});

function switchChipAdviceTab(e) {
  if (currentChipAdviceTab.value != e.currentIndex) {
    currentChipAdviceTab.value = e.currentIndex;
  }
}

const isShowAllCorruptions = ref(false);
const getDisplayCorruptions = computed(() => {
  if (isShowAllCorruptions.value) {
    return currentData.value?.wowheadBis?.corruptions?.items;
  }
  return currentData.value?.wowheadBis?.corruptions?.items.filter(item => item.included);
});
const switchCorruptionText = computed(() => isShowAllCorruptions.value ? '隐藏冗余腐蚀' : '查看全部腐蚀');

//#endregion

//#region 饰品
const currentTrinketTab = ref(0);
const trinketTabs = ['总体排名', '大秘境使用率排行'];

function switchTrinketTab(e) {
  if (currentTrinketTab.value != e.currentIndex) {
    currentTrinketTab.value = e.currentIndex;
  }
}

const getTrinketDps = computed(() => {
  return (rawDps: string) => rawDps
    ? (Number(rawDps?.replaceAll(',', '')) / 1000000).toFixed(2) + 'M'
    : 0;
});
//#endregion

//#region 大秘境TIPS
const dungeons = ref<IDungeonDTO[]>([]);
const dungeonTip = ref<any>();
const currentDungeonId = ref(-1);
const tipCollapseIndex = ref(['0']);

// TODO: 引入hook替代
const renderTip = computed(() => {
  return (text: string, commonColor: string = '', emphasisColor: string = 'rgb(255, 209, 0)') => {
    const wrappedText = `<p style="font-size: 28rpx; color: ${commonColor}">${text}</p>`;

    return wrappedText.replace(
      /\[(.*?)\]/g,
      (match, p) =>
        `<b style="font-size: 28rpx;color: ${emphasisColor}; font-weight: bold;padding: 0 2px">${p}</b>`,
    );
  };
});

async function getSeasonDungeons() {
  dungeons.value = await querySeasonDungeons();
  currentDungeonId.value = dungeons.value[0]?.id;
}

const tipMessage = ref('');

async function getDungeonTip() {
  const {
    isSuccess,
    data,
  } = await queryDungeonTip({
    roleClass: classKey.value,
    classSpec: specKey.value,
    dungeonId: currentDungeonId.value,
  });
  if (isSuccess) {
    dungeonTip.value = data;
  } else {
    tipMessage.value = data;
  }
}

const dungeonCollapse = ref<any>();

async function switchDungeon(id: number) {
  if (currentDungeonId.value !== id) {
    currentDungeonId.value = id;
    await getDungeonTip();

    // 更新副本数据之后，展开内容的高度有白边
    nextTick(() => {
      dungeonCollapse.value?.resize?.();
    });
  }
}

const spellpopup = ref<any>('');
const currentSpells = ref<any>();

async function displaySpells(params: any) {
  if (params?.length) {
    const ids = params?.map((item: any) => item.id);
    currentSpells.value = await querySpellsInTip(ids);
    if (currentSpells.value.filter((item: any) => item !== null).length) {
      spellpopup.value?.open();
    } else {
      messageType.value = 'error';
      messageText.value = '获取技能数据失败';
      messagePopup.value?.open?.();
    }
  }
}

//#endregion

// region 天赋
const talentData = ref();
// endregion

//#region 切换底部菜单
const activeMenu = ref('index');
const footerMenus = [
  {
    title: '总览',
    value: 'index',
    icon: 'icon-Crown-',
  },
  {
    title: '天赋',
    value: 'talent',
    icon: 'icon-tree',
  },
  {
    title: '分享',
    value: 'share',
    icon: 'icon-share',
  },
  {
    title: '配装',
    value: 'bis',
    icon: 'icon-leg-armor',
  },
  {
    title: '大秘境',
    value: 'mythic',
    icon: 'icon-dungeon',
  },
];

async function onMenuChange(menuValue: string) {
  if (menuValue === 'mythic' && !dungeons.value?.length) {
    uni.showLoading({
      title: '银子加载中...',
      mask: true,
    });
    await getSeasonDungeons();
    await getDungeonTip();
    uni.hideLoading();
  } else if (menuValue === 'talent') {
    talentData.value = await queryTalent(specKey.value, classKey.value);
  }
}

//#endregion
</script>

<style lang="scss" scoped>
.rating-item {
  margin-bottom: 6px;
  padding: 6px;
  padding-bottom: 0;

  .label {
    color: #fff;
    font-size: 30rpx;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
  }

  .sub-label {
    color: rgb(149, 152, 155);
    font-size: 14px;
  }

  .bars {
    margin: 4px 0;
    display: flex;
    justify-content: space-between;

    .bar {
      width: 18%;
      height: 12px;
      border-radius: 6px;
      background-color: rgb(43, 44, 44);
    }

    .green-bar {
      background-color: rgb(25, 159, 47);
    }

    .orange-bar {
      background-color: rgb(240, 154, 24);
    }

    .red-bar {
      background-color: #bd2625;
    }
  }
}

::v-deep .tiers-card .uni-card {
  margin-top: 20rpx !important;
  margin-bottom: 20rpx !important;
}

.tiers {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 0 12rpx;
  gap: 24rpx;
}

.tier-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60rpx;
  background-color: $uni-bg-color-grey-lighter;
  border-radius: 30rpx;
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;

  .tier-icon {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    text-align: center;
    line-height: 60rpx;
    font-weight: bold;
  }

  .tier-prefix,
  .tier-suffix {
    display: flex;
    align-items: center;
    gap: 6px;

    .tier-text {
      display: flex;
      align-items: center;
      gap: 8rpx;

      .tier-text__diff {
        font-weight: normal;
      }
    }
  }

  .tier-suffix {
    padding-right: 10rpx;
    color: $uni-color-primary;
  }

  .S-tier {
    background-color: $color-s-tier;
  }

  .A-tier {
    background-color: $color-a-tier;
  }

  .B-tier {
    background-color: $color-b-tier;
  }

  .C-tier {
    background-color: $color-c-tier;
  }

  .D-tier {
    background-color: $color-d-tier;
  }
}

.stats-info {
  text-align: center;
  margin-bottom: 10rpx;

  text {
    font-weight: bold;
    color: #fff;
  }
}

.stats {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .stats__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;

    text {
      line-height: 26rpx;
      color: inherit;
    }

    view:first-child {
      text {
        font-size: 24rpx;
        font-weight: bold;
      }
    }
  }

  text {
    font-size: 24rpx;
    color: #fff;
  }

  image {
    width: 20px;
    height: 20px;
  }
}

.stats-charts {
  margin-top: 10rpx;
  display: flex;
  height: 100rpx;
  gap: 6rpx;

  .chart-item {
    flex: 1;
    display: flex;
    border-top-width: 4rpx;
    border-top-style: solid;

    .chart-item__bar {
      flex: 1;
    }
  }
}

$light-border: rgb(68, 68, 68);

::v-deep .uni-section {
  .uni-section-header {
    background-color: $uni-bg-color-grey !important;
    color: inherit !important;

    .uni-section-header__content {
      color: inherit !important;

      .uni-section-header__content-sub {
        color: inherit !important;
        text-align: center;
      }

      .uni-section__content-title {
        color: inherit !important;
        text-align: center;
        font-weight: 800;
        font-size: 32rpx !important;
        display: inline-block;
        box-sizing: border-box;

        &::before,
        &::after {
          content: '';
          position: absolute;
          transform: translateY(-50%);
          width: 30%;
          height: 2px;
          background-color: rgb(68, 68, 68);
        }

        &::before {
          left: 0;
          top: 50%;
        }

        &::after {
          right: 0;
          top: 50%;
        }
      }
    }
  }

  .uni-section-content {
    background-color: $uni-bg-color-grey;
  }
}

::v-deep uni-card {
  .uni-card {
    width: 96vw;
    box-sizing: border-box;
    padding: 0 !important;
    margin: 0 auto !important;
    border: none !important;
    background-color: $uni-bg-color-grey-light !important;
  }
}

.justify-between {
  display: flex;
  justify-content: space-between;
}

::v-deep .preview-image {
  width: 10vw;
  height: 10vw;
}

::v-deep .previw-popup .uni-card {
  width: 70vw !important;
  border: 1px solid #ffffff !important;
  margin-bottom: 10px !important;

  text {
    color: #fff;
  }

  .uni-card__content {
    display: flex;
    flex-direction: column;
  }

  .spell-name {
    font-size: 16px;
  }

  .spell-prop {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    text {
      width: 45%;

      &:nth-child(3),
      &:nth-child(5) {
        text-align: right;
      }
    }
  }

  .name {
    color: $color-mythic;
  }

  .qulity,
  .bonus-stat,
  .spell .modified-crafting {
    color: $color-uncommon;
  }

  .item-level,
  .description {
    color: $uni-text-color-inverse;

    text {
      color: $uni-text-color-inverse;
      font-weight: bold;
    }
  }

  .price {
    display: flex;

    view {
      display: flex;
      align-items: center;
      margin-right: 4px;
    }

    image {
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }
  }
}

::v-deep .uni-table {
  background-color: rgb(40, 40, 40) !important;
  border: 2px $light-border solid;
  table-layout: fixed;
  width: 100%;

  .uni-table-th,
  .uni-table-td {
    padding-left: 4px !important;
    padding-right: 4px !important;
    border-bottom: 1px $uni-bg-color solid !important;

    .slot-container {
      display: flex;
      flex-direction: column;

      image {
        margin-right: 4px;
      }
    }

    .slot-container__item,
    .slot-container__enhancement {
      display: flex;
      align-items: center;
    }
  }

  .uni-table-th {
    font-weight: 800;
    color: #ffffff;
    font-size: 30rpx;
  }

  .uni-table-td {
    font-weight: 400;
    font-size: 28rpx;


    &:first-child {
      color: rgb(221, 221, 221);
    }

    &:nth-child(2) {
      color: rgb(163, 53, 238);
    }

    &:nth-child(3) {
      color: rgb(221, 221, 221);
      width: 100px !important;
    }
  }

  .is-loot {
    color: $uni-text-color-inverse !important;
  }
}

::v-deep .uni-collapse {
  background-color: rgb(40, 40, 40) !important;
  border-radius: 10px;

  .uni-collapse-item__title {
    border-bottom-color: $uni-bg-color !important;
  }

  .uni-collapse-item__title-box {
    border-radius: 10px;
    background-color: rgb(40, 40, 40) !important;
    color: $uni-color-primary;
    font-weight: bold;

    .uni-collapse-item__title-text {
      font-size: 16px !important;
    }
  }

  .uni-collapse-item__wrap-content {
    background-color: rgb(40, 40, 40) !important;
    color: #fff;
    border-bottom-color: $uni-bg-color-grey-light !important;

    .list-style,
    .list-style-empty {
      position: relative;

      &::before {
        content: '';
        position: absolute;
        width: 4px;
        height: 4px;
        top: 10px;
        left: -12px;
        border-radius: 50%;
        border: 1px solid #fff;
      }
    }

    .list-style {
      &::before {
        background-color: #fff;
      }
    }

    .ul .li {
      margin-left: 16px;
      color: #fff;
      font-weight: normal;
      position: relative;
    }

    & > .ul {
      padding: 0 24rpx;
      font-size: 28rpx;
      font-weight: bold;
      color: $uni-color-primary;

      > .li > .ul {
        margin-left: 32rpx;

        & > .li > .ul {
          margin-left: 32rpx;
        }
      }
    }
  }
}

.disale-ellipsis {
  white-space: normal !important;
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-container {
  display: flex;
  justify-content: space-between;
  font-size: 30rpx;

  .to-enhancement {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    color: $uni-color-primary;
    font-weight: bold;
    margin-right: 6px;
    gap: 6px;
  }
}

.custom-header-item {
  display: flex;
  align-items: center;
  gap: 10px;

  .custom-header-item__button {
    display: flex;
    align-items: center;

    color: $uni-text-color-inverse;
    font-weight: normal;
    gap: 6px;

    image {
      width: 20px;
      height: 20px;
    }
  }
}

.stat-menu,
.talent .menu,
.bis .menu {
  margin-bottom: 10px;

  .menu_active {
    color: #ffffff;

    &::before {
      content: '';
      width: calc(100% - 10px);
      height: 4px;
      background-color: red;
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  text {
    padding: 0 10px;
    font-weight: 800;
    line-height: 30px;
    height: 30px;
    position: relative;

    &:first-child {
      // padding-left: 6px;
    }

    &:not(:last-child)::after {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 2px;
      height: 10px;
      background-color: $light-border;
    }
  }
}

.talent-menu {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;

  .menu_active {
    &::before {
      bottom: 0 !important;
    }
  }

  text {
    max-width: 50%;
    flex: 1;
    display: block;
    text-align: center;
  }
}

::v-deep .dungeon .uni-card .uni-card__content {
  padding-bottom: 2rem;
}

.dungeon .menu {
  display: flex;
  flex-wrap: wrap;

  .menu_active {
    color: #ffffff;

    // border-bottom: 4px red solid;
    &::before {
      content: '';
      width: calc(100% - 10px);
      height: 4px;
      background-color: red;
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  text {
    width: 19%;
    margin-bottom: 20rpx;
    padding: 0 20rpx;
    font-weight: 800;
    font-size: 30rpx;
    line-height: 60rpx;
    height: 60rpx;
    position: relative;

    &:not(:last-child):not(:nth-child(4))::after {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4rpx;
      height: 20rpx;
      background-color: $light-border;
    }
  }
}

.tier {
  margin-bottom: 8px;
  display: flex;

  .tier-label {
    width: 180rpx;
    min-height: 160rpx;
    border-radius: 12rpx;
    font-size: 100rpx;
    line-height: 100rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #ffffff;

    &[data-label='0'] {
      background-color: $color-legend;
    }

    &[data-label='1'] {
      background-color: $color-mythic;
    }

    &[data-label='2'] {
      background-color: $color-rare;
    }

    &[data-label='3'] {
      background-color: $color-uncommon;
    }
  }

  .trink-container {
    margin-left: 10px;
    flex: 1;
    display: flex;
    flex-wrap: wrap;

    image {
      height: 40px;
      width: 40px;
      border-radius: 50%;
      margin-right: 6px;
    }
  }
}

// trikets
.popular-trinkets {
  display: flex;
  flex-direction: column;
  gap: 12rpx;

  .popular-trinkets__item {
    display: flex;
    justify-content: space-between;
    font-size: 26rpx;

    .popular-trinkets__item-left {
      display: flex;
      align-items: center;
      gap: 12rpx;
      // color: $color-mythic;
      font-weight: bold;

      image {
        width: 60rpx;
        border-radius: 10rpx;
      }
    }

    .popular-trinkets__item-right {
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 30rpx;

      .popular-trinkets__item-right__max-key {

      }

      .popular-trinkets__item-right__dps {

      }

      .popular-trinkets__item-right__popularity {
        text-align: right;
        min-width: 80rpx;
      }
    }

    &:nth-child(1),
    &:nth-child(2) {
      color: $color-legend;
    }

    &:nth-child(3),
    &:nth-child(4) {
      color: $color-rare;
    }
  }
}

// 悬浮按钮
::v-deep .uni-fab {
  transform: scale(0.727) !important;
  top: -4px;
}

.fab-active {
  ::v-deep .uni-fab {
    top: -24px !important;
  }
}

::v-deep .uni-fab__circle {
  transform: scale(0.75) !important;
  top: -4px;
  box-shadow: 0 0 6px 2px rgb(255 255 255 / 21%) !important;

  image {
    width: 24px !important;
    height: 24px !important;
  }

  text {
    font-size: 14px !important;
    line-height: 14px !important;
  }

  .uni-icons {
    font-size: 24px !important;
    line-height: 24px !important;
  }
}

.fab-disabled {
  display: none;
}

.dungeon_empty {
  text-align: center;
  margin-bottom: 2rem;
}

.talent-card {
  margin-top: 1rem;
  width: 100%;
  /* 或者你想要的固定宽度 */
  box-sizing: border-box;

  view {
    color: inherit;
    font-size: medium;
    text-align: center;
    margin-bottom: 0.2rem;
  }
}

.talent-image {
  width: 100%;
  /* 或者你想要的固定宽度 */
  object-fit: cover;
}

.talent-export {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0.8rem 0 0.2rem 0;

  .talent-export__title {
    font-size: 14px;
    font-weight: bold;
    margin-left: 15px;
  }

  text {
    margin-left: 0.4rem;
    color: $uni-color-primary;
  }
}

::v-deep .uni-list {
  background-color: transparent !important;

  .uni-list--border-top,
  .uni-list--border-bottom {
    height: 0 !important;
  }

  .uni-list-item {
    background-color: transparent !important;

    .uni-list-item__content {
      text {
        color: $uni-color-primary;
        font-weight: bold;
        font-size: 30rpx;
      }
    }

    .uni-list-item__extra {
      text {
        color: #bbb;
        font-size: 24rpx;
      }
    }
  }
}

.ad-container {
  margin-top: 2rem;
}

.footer {
  height: 150rpx;
  width: 1vw;
}

.stat-info {
  margin-left: 1.6rem;
  margin-right: 1rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: -0.6rem;
    top: 0.5rem;
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 50%;
    background: #fff;
  }
}

#puzzling-cartel-chip-advice, #corruptions {
  .advice-text {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 30rpx;
    margin-bottom: 20rpx;

    image {
      width: 36rpx;
    }
  }

  .overall-info {
    color: #fff;
    font-size: 26rpx;
  }

  .advice-item {
    font-size: 26rpx;
    margin-bottom: 12rpx;

    .data-item {
      display: flex;
      gap: 12rpx;
      align-items: center;
    }

    .data-info {
      font-size: 26rpx;
    }

    .advice-item__index {
      color: $color-legend;
    }

    image {
      width: 60rpx;
      border-radius: 10rpx;
    }

    .advice-item__name {
      color: $color-rare;
      font-weight: bold;
    }

    .advice-item__name--faded {
      color: #999;
    }

    .advice-item__name--heroic {
      color: $color-mythic;
    }

    .advice-item__name--mythic {
      color: $color-legend;
    }

    .advice-item__more {
      flex: 1;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-left: 4rpx;
      gap: 4rpx;
      color: $uni-color-primary;
    }
  }

  .advice-item--same-priority {
    padding-left: 60rpx;
    position: relative;

    &:before {
      content: '=';
      color: #fff;
      position: absolute;
      left: 30rpx;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }
}

// 分段器
::v-deep .segmented-control {
  gap: 20rpx;
  margin-bottom: 20rpx;

  .segmented-control__item {
    flex: none !important;

    .segmented-control__text {
      font-size: small;
      color: inherit !important;
    }

    .segmented-control__item--text {
      font-weight: bold;
      color: #fff !important;
    }
  }
}
</style>
