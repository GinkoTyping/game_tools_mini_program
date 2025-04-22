<template>
  <uni-notice-bar
    single
    show-icon
    show-get-more
    color="#2979FF"
    background-color="#EAF2FF"
    more-text="去看看"
    text="完善BIS配装的宝石、附魔"
    @click="() => toHotSpot()"
  />
  <view>
    <ShareIcon />
  </view>
  <uni-section
    id="overview"
    :class="[classKey]"
    title="总览"
    :sub-title="`已更新：${currentData?.updatedAt}`"
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
  </uni-section>

  <uni-section
    :class="[classKey]"
    title="属性优先级"
    @click="switchStatSource"
    :sub-title="statSourceText"
  >
    <uni-card class="section-card" v-show="statSource === 'wowhead'">
      <view class="menu stat-menu">
        <text
          v-for="(type, index) in currentData?.detailedStatsPriority?.best"
          :key="type.name"
          class="ellipsis"
          @click="() => switchStatType(index)"
          :class="[classKey, currentStatType === index ? 'menu_active' : '']"
          >{{ type.name }}</text
        >
      </view>
      <view class="stats" style="margin: 1rem 0">
        <template v-for="(statText, index) in currentStatList" :key="statText">
          <text>{{ statText }}</text>
          <image
            v-show="index !== currentStatList.length - 1"
            src="/static/icon/dayu.svg"
          />
        </template>
      </view>
      <uni-collapse ref="collapse">
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
      <view class="stats">
        <view class="stats__item">
          <text>{{ currentData?.archonStatsPriority.priority[0].label }}</text>
          <text>{{ currentData?.archonStatsPriority.priority[0].value }}</text>
        </view>
        <image
          :src="`/static/icon/${relationIcon(
            currentData?.archonStatsPriority.relations[0]
          )}.svg`"
        ></image>
        <view class="stats__item">
          <text>{{ currentData?.archonStatsPriority.priority[1].label }}</text>
          <text>{{ currentData?.archonStatsPriority.priority[1].value }}</text>
        </view>
        <image
          :src="`/static/icon/${relationIcon(
            currentData?.archonStatsPriority.relations[1]
          )}.svg`"
        ></image>
        <view class="stats__item">
          <text>{{ currentData?.archonStatsPriority.priority[2].label }}</text>
          <text>{{ currentData?.archonStatsPriority.priority[2].value }}</text>
        </view>
        <image
          :src="`/static/icon/${relationIcon(
            currentData?.archonStatsPriority.relations[2]
          )}.svg`"
        ></image>
        <view class="stats__item">
          <text>{{ currentData?.archonStatsPriority.priority[3].label }}</text>
          <text>{{ currentData?.archonStatsPriority.priority[3].value }}</text>
        </view>
      </view>
    </uni-card>
  </uni-section>

  <uni-section class="talent" :class="[classKey]" title="天赋">
    <uni-card class="section-card">
      <view class="menu talent-menu">
        <text
          v-for="(item, index) in currentData?.talents"
          :key="item.talent"
          class="ellipsis"
          @click="() => switchTalent(index)"
          :class="[classKey, currentTalentIndex === index ? 'menu_active' : '']"
          >{{ item.talent }}</text
        >
      </view>
      <view class="talent-export" @click="exportTalentCode">
        <text class="talent-export__title"
          >当前：{{ currentData?.talents[currentTalentIndex]?.talent }}</text
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
          v-for="(url, index) in currentData?.talents[currentTalentIndex]?.url"
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

  <ad-custom unit-id="adunit-43dfd4fbca02d516" class="ad-container"></ad-custom>

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
            >{{ bis.title }}</text
          >
        </view>
        <view
          class="to-enhancement"
          @click="displayEnhancement = !displayEnhancement"
        >
          <text>{{ switchEnhancementText }}</text>

          <image
            src="https://ginkolearn.cyou/api/wow/assets/blizz-media-image/inv_misc_enchantedscroll.jpg"
          />
        </view>
      </view>

      <uni-table ref="table" stripe emptyText="暂无更多数据">
        <uni-tr>
          <uni-th width="45" align="left">部位</uni-th>
          <uni-th width="160" align="left">装备</uni-th>
          <uni-th width="100" align="left">来源</uni-th>
        </uni-tr>
        <uni-tr v-for="(item, index) in tableData" :key="index">
          <uni-td>{{ item.slot }}</uni-td>
          <uni-td>
            <view class="slot-container">
              <view class="slot-container__item">
                <img
                  :src="currentImageSrc(item)"
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
                  >{{ item.name }}</view
                >
              </view>
              <template v-if="displayEnhancement">
                <view
                  class="slot-container__enhancement"
                  v-for="enhancement in item.enhancements"
                  :key="enhancement.id"
                >
                  <img
                    :src="currentImageSrc(enhancement)"
                    style="width: 14px; height: 14px"
                  />
                  <view
                    class="ellipsis"
                    style="flex: 1"
                    :class="[item.wrap ? 'disale-ellipsis' : '']"
                    @click="
                      () => {
                        switchDetail(true, enhancement, 'item');
                      }
                    "
                    >{{ enhancement.name }}</view
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
                item.source.isLoot ? 'is-loot' : '',
              ]"
              @click="() => switchWrap(item)"
              >{{ item.source.source }}</view
            >
          </uni-td>
        </uni-tr>
      </uni-table>
    </uni-card>
  </uni-section>
  <uni-section :class="[classKey]" title="饰品">
    <uni-card class="section-card">
      <view class="tier" v-for="(tier, index) in currentData?.trinkets">
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
    </uni-card>
  </uni-section>

  <uni-section id="enhancement" :class="[classKey]" title="附魔推荐">
    <uni-card class="section-card">
      <uni-table ref="table" stripe emptyText="暂无更多数据">
        <uni-tr>
          <uni-th align="left">部位</uni-th>
          <uni-th align="left">装备强化</uni-th>
        </uni-tr>
        <uni-tr v-for="(item, index) in currentData?.enhancement" :key="index">
          <uni-td>{{ item.slot }}</uni-td>
          <uni-td>
            <view class="items">
              <view
                class="slot-container"
                v-for="child in item.items"
                :key="child?.id"
              >
                <view class="slot-container__item">
                  <img
                    :src="currentImageSrc(child)"
                    alt=""
                    srcset=""
                    style="width: 14px; height: 14px"
                  />
                  <view
                    class="ellipsis"
                    style="flex: 1; width: auto !important"
                    :class="[child?.wrap ? 'disale-ellipsis' : '']"
                    @click="
                      () => {
                        switchDetail(true, child);
                        switchWrap(child);
                      }
                    "
                    >{{ child?.name_zh }}</view
                  >
                </view>
              </view>
            </view>
          </uni-td>
        </uni-tr>
      </uni-table>
    </uni-card>
  </uni-section>

  <ad-custom unit-id="adunit-43dfd4fbca02d516" class="ad-container"></ad-custom>

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
          >{{ dungeon.name_zh }}</text
        >
      </view>
      <view class="dungeon_empty" v-show="tipMessage?.length">{{
        tipMessage
      }}</view>
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
            }}</text>
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
  <view class="footer"></view>

  <uni-popup ref="popup">
    <uni-load-more
      v-show="status === 'loading'"
      color="#007AFF"
      :status="status"
    />
    <img
      v-show="currentItem?.image && status !== 'loading'"
      lazy-load
      class="preview-image"
      :src="currentImageSrc(currentItem)"
      alt=""
    />
    <uni-card
      v-show="status !== 'loading' && currentDetails"
      class="previw-popup"
    >
      <text class="name">{{ currentDetails?.name }}</text>
      <text class="qulity">{{ currentDetails.quality?.name }}</text>
      <!-- TODO 显示的装等和版本不一致 有误导性 -->
      <!-- <text class="item-level">物品等级：{{ currentDetails.level }}</text> -->
      <text class="binding">{{
        currentDetails.preview_item?.binding?.name
      }}</text>
      <text class="gem">{{
        currentDetails.preview_item?.gem_properties?.effect
      }}</text>
      <text class="modified-crafting">{{
        currentDetails.modified_crafting?.description
      }}</text>
      <view class="type">
        <text>{{ currentDetails.preview_item?.inventory_type?.name }}</text>
        <text v-show="currentDetails.item_class?.id === 2">{{
          currentDetails.preview_item?.item_subclass?.name
        }}</text>
      </view>
      <view
        class="damage justify-between"
        v-show="currentDetails.preview_item?.weapon"
      >
        <text>{{
          currentDetails.preview_item?.weapon?.damage?.display_string
        }}</text>
        <text>{{
          currentDetails.preview_item?.weapon?.attack_speed?.display_string
        }}</text>
      </view>
      <text class="damage-dps">{{
        currentDetails.preview_item?.weapon?.dps?.display_string
      }}</text>
      <text
        class="non-bonus-stat"
        v-for="stat in currentDetails.preview_item?.stats?.filter((item: any) => !item.is_equip_bonus)"
      >
        {{ stat.display.display_string }}
      </text>
      <text
        class="bonus-stat"
        v-for="stat in currentDetails.preview_item?.stats?.filter((item: any) => item.is_equip_bonus)"
      >
        {{ stat.display.display_string }}
      </text>
      <text
        class="spell"
        v-show="currentDetails.preview_item?.spells?.length"
        v-for="spell in currentDetails.preview_item?.spells"
        :key="spell.spell.id"
        >{{ spell.description }}</text
      >

      <text class="durability">{{
        currentDetails.preview_item?.durability?.display_string
      }}</text>
      <text
        class="requirements"
        v-show="currentDetails.preview_item?.requirements"
        >{{
          currentDetails.preview_item?.requirements?.level.display_string
        }}</text
      >
      <text class="description" v-show="currentDetails.source?.source"
        >来源：<text>{{ currentDetails.source?.source }}</text></text
      >
      <text v-show="currentDetails?.description" class="description"
        >“{{ currentDetails.description }}”</text
      >
      <view class="price" v-if="currentDetails.preview_item?.sell_price">
        <view>
          <text>售价：</text>
        </view>
        <view>
          <img src="/static/images/wow/money-gold.gif" alt="" srcset="" />
          <text>{{
            currentDetails.preview_item?.sell_price?.display_strings.gold
          }}</text>
        </view>
        <view>
          <img src="/static/images/wow/money-silver.gif" alt="" srcset="" />
          <text>{{
            currentDetails.preview_item?.sell_price?.display_strings.silver
          }}</text>
        </view>
        <view>
          <img src="/static/images/wow/money-copper.gif" alt="" srcset="" />
          <text>{{
            currentDetails.preview_item?.sell_price?.display_strings.copper
          }}</text>
        </view>
      </view>
    </uni-card>
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
          >{{ spell.range }}</text
        >
        <text v-show="spell.cast_time?.length">{{ spell.cast_time }}</text>
        <text v-show="spell.cooldown?.length && spell.cooldown != 'n/a'">{{
          spell.cooldown
        }}</text>
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

  <view
    ref="fabContainerRef"
    :class="[
      'animate__animated',
      isInitPage ? 'fab-disabled' : '',
      isShowFab ? 'animate__fadeIn' : 'animate__fadeOut',
    ]"
  >
    <uni-fab
      ref="uniFabRef"
      :class="[isOpenFab ? 'fab-active' : '']"
      :pattern="pattern"
      :content="fabContent"
      horizontal="right"
      vertical="top"
      direction="vertical"
      @trigger="onClickFabIcon"
      @fabClick="onSwitchFabIcon"
    />
  </view>
</template>

<script lang="ts" setup>
// TODO 新增对应专精的图片
import { onLoad, onShow, onPageScroll, onHide } from '@dcloudio/uni-app';
import { onShareAppMessage } from '@dcloudio/uni-app';
import { computed, nextTick, ref } from 'vue';

import { IBisItem, Relation } from '@/interface/IWow';
import {
  queryBis,
  queryItemPreview,
  querySeasonDungeons,
  IDungeonDTO,
  queryDungeonTip,
  querySpellsInTip,
} from '@/api/wow';
import ShareIcon from '@/components/ShareIcon.vue';
import TopMessage from '@/components/TopMessage.vue';

const classKey = ref('');
const specKey = ref('');
const currentData = ref<any>();
const query = ref<any>({});
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
  await getSeasonDungeons();
  await getDungeonTip();

  uni.hideLoading();

  setNaviTitle(`${options.title} ${currentData.value.version}`);
});
onShow(() => {
  isOpenFab.value = false;
});

// 避免悬浮的展开的菜单UI异常
onHide(() => {
  if (uniFabRef.value?.isShow) {
    uniFabRef.value.close?.();
  }
});

async function getBasicBisData() {
  currentData.value = await queryBis(classKey.value, specKey.value);
  currentTableName.value = currentData.value.bisItems[0]?.title;
}

onShareAppMessage(() => {
  const { title, classKey, specKey } = query.value;

  return {
    title: `${title}·属性配装和攻略`,
    path: `pages/bis/index?classKey=${classKey}&specKey=${specKey}&title=${title}`,
  };
});

// 评分
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

// 属性优先级
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
const statSourceText = computed(() =>
  statSource.value === 'wowhead' ? '点击查看简略版' : '点击查看详细版'
);
function switchStatSource() {
  if (statSource.value === 'wowhead') {
    statSource.value = 'maxroll';
  } else {
    statSource.value = 'wowhead';
  }
}
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
      .priorityList
);
function switchStatType(type: number) {
  currentStatType.value = type;
}

// 天赋
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
    success: function () {
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
    (item: string) => getTalentImage(item)
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
    item => item.title === currentTableName.value
  )?.items;
});
function switchBisTable(tableName: string) {
  if (currentTableName.value !== tableName) {
    currentTableName.value = tableName;
  }
}

function setNaviTitle(title: string) {
  uni.setNavigationBarTitle({
    title: title,
  });
}

function switchWrap(item: IBisItem) {
  item.wrap = !item.wrap;
}
const displayEnhancement = ref(true);
const switchEnhancementText = computed(() =>
  displayEnhancement.value ? '隐藏' : '显示'
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
  forceType?: string
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
      const { data, statusCode } = await queryItemPreview(item.id);
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

//#region 大秘境TIPS
const dungeons = ref<IDungeonDTO[]>([]);
const dungeonTip = ref<any>();
const currentDungeonId = ref(-1);
const tipCollapseIndex = ref(['0']);

// TODO: 引入hook替代
const renderTip = computed(() => {
  return (text: string) => {
    const wrappedText = `<p style="font-size: 14px;">${text}</p>`;

    return wrappedText.replace(
      /\[(.*?)\]/g,
      (match, p) =>
        `<b style="font-size: 14px;color: rgb(255, 209, 0); font-weight: bold;">${p}</b>`
    );
  };
});
async function getSeasonDungeons() {
  dungeons.value = await querySeasonDungeons();
  currentDungeonId.value = dungeons.value[0]?.id;
}
const tipMessage = ref('');
async function getDungeonTip() {
  const { isSuccess, data } = await queryDungeonTip({
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
const pattern = ref({
  color: '#7A7E83',
  backgroundColor: '#fff',
  selectedColor: '#007AFF',
  buttonColor: '#007AFF',
  iconColor: '#fff',
});
const fabContent = ref([
  {
    iconPath: '/static/icon/rating.svg',
    selectedIconPath: '/static/icon/rating.svg',
    text: '总览',
    active: false,
  },
  {
    iconPath: '/static/icon/tree.svg',
    selectedIconPath: '/static/icon/tree.svg',
    text: '天赋',
    active: false,
  },
  {
    iconPath: '/static/icon/leg-armor.svg',
    selectedIconPath: '/static/icon/leg-armor.svg',
    text: '配装',
    active: false,
  },
  {
    iconPath: '/static/icon/textile-products.svg',
    selectedIconPath: '/static/icon/textile-products.svg',
    text: '攻略',
    active: false,
  },
]);
const isOpenFab = ref(false);
const isShowFab = ref(false);
const isInitPage = ref(true);
const fabContainerRef = ref<any>();
const uniFabRef = ref<any>();
function onClickFabIcon(e: { index: number }) {
  let selector = '';

  switch (e.index) {
    case 0:
      selector = '#overview';
      break;
    case 1:
      selector = '.talent';
      break;
    case 2:
      selector = '.bis';
      break;
    case 3:
      selector = '.dungeon';
      break;
    default:
      break;
  }

  uni.pageScrollTo({ selector });
}
function onSwitchFabIcon() {
  isOpenFab.value = !isOpenFab.value;
}

onPageScroll(e => {
  if (e.scrollTop > 300 && !isShowFab.value) {
    isInitPage.value = false;
    isShowFab.value = true;
  } else if (e.scrollTop <= 300 && isShowFab.value) {
    isShowFab.value = false;
  }
});

//#region 附魔
function toHotSpot() {
  uni.pageScrollTo({ selector: '#enhancement' });
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
    font-size: 16px;
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
.stats {
  padding: 0 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .stats__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text:last-child {
      line-height: 14px;
      font-size: 12px;
      font-weight: normal;
    }
  }
  text {
    font-size: 16px;
    color: #fff;
    font-weight: bolder;
  }
  image {
    width: 20px;
    height: 20px;
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
        font-size: 18px !important;
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
  }
  .uni-table-td {
    font-weight: 400;
    &:first-child {
      color: rgb(221, 221, 221);
    }
    &:nth-child(2) {
      color: rgb(163, 53, 238);
      view.bis-item {
        width: 160px !important;
      }
    }
    &:nth-child(3) {
      color: rgb(221, 221, 221);
      view {
        width: 100px !important;
      }
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
      padding: 0 12px;
      font-size: 14px;
      font-weight: bold;
      color: $uni-color-primary;
      > .li > .ul {
        margin-left: 16px;
        & > .li > .ul {
          margin-left: 16px;
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
  .to-enhancement {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    color: $uni-text-color-inverse;
    font-weight: bold;
    margin-right: 6px;
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
    margin-bottom: 10px;
    padding: 0 10px;
    font-weight: 800;
    line-height: 30px;
    height: 30px;
    position: relative;
    &:not(:last-child):not(:nth-child(4))::after {
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

.tier {
  margin-bottom: 8px;
  display: flex;
  .tier-label {
    width: 90px;
    min-height: 80px;
    border-radius: 6px;
    font-size: 50px;
    line-height: 50px;
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
  width: 100%; /* 或者你想要的固定宽度 */
  box-sizing: border-box;
  view {
    color: inherit;
    font-size: medium;
    text-align: center;
    margin-bottom: 0.2rem;
  }
}
.talent-image {
  width: 100%; /* 或者你想要的固定宽度 */
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
        font-size: 16px;
      }
    }
    .uni-list-item__extra {
      text {
        color: #bbb;
        font-size: 12px;
      }
    }
  }
}
.ad-container {
  margin-top: 2rem;
}

.footer {
  height: 4rem;
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
</style>
