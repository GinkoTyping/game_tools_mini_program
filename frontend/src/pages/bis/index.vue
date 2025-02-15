<template>
  <uni-section :class="[classKey]" title="总览">
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
  <uni-section :class="[classKey]" title="属性优先级">
    <uni-card class="section-card">
      <view class="stats">
        <text>{{ currentData?.statsPriority[0].stats[0] }}</text>
        <image
          :src="`/static/icon/${relationIcon(
            currentData?.statsPriority[0].relations[0] ?? Relation.Greater
          )}.svg`"
        ></image>
        <text>{{ currentData?.statsPriority[0].stats[1] }}</text>
        <image
          :src="`/static/icon/${relationIcon(
            currentData?.statsPriority[0].relations[1] ?? Relation.Greater
          )}.svg`"
        ></image>
        <text>{{ currentData?.statsPriority[0].stats[2] }}</text>
        <image
          :src="`/static/icon/${relationIcon(
            currentData?.statsPriority[0].relations[2] ?? Relation.Greater
          )}.svg`"
        ></image>
        <text>{{ currentData?.statsPriority[0].stats[3] }}</text>
        <image
          :src="`/static/icon/${relationIcon(
            currentData?.statsPriority[0].relations[3] ?? Relation.Greater
          )}.svg`"
        ></image>
        <text>{{ currentData?.statsPriority[0].stats[4] }}</text>
      </view>
    </uni-card>
  </uni-section>
  <uni-section class="bis" :class="[classKey]" title="BIS配装">
    <uni-card class="section-card">
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
              <img
                :src="`https://ginkolearn.cyou/api/wow/assets/items/${item.image}`"
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
          </uni-td>
          <uni-td>
            <view
              class="ellipsis"
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
              :src="`https://ginkolearn.cyou/api/wow/assets/trinkets/${trinket.image}`"
              alt=""
              srcset=""
            />
          </view>
        </view>
      </view>
    </uni-card>
  </uni-section>
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
      <uni-collapse v-model="tipCollapseIndex">
        <uni-collapse-item
          :open="index === 0"
          :title="tipKind.title"
          v-for="(tipKind, index) in dungeonTip?.children"
          :key="tipKind.title"
        >
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
  <uni-popup ref="popup">
    <uni-load-more
      v-show="status === 'loading'"
      color="#007AFF"
      :status="status"
    />
    <img
      v-show="currentItem?.image && status !== 'loading'"
      class="preview-image"
      :src="`/static/images/wow/${currentItem?.source ? 'items' : 'trinkets'}/${
        currentItem?.image
      }`"
      alt=""
    />
    <uni-card v-show="status !== 'loading'" class="previw-popup">
      <text class="name">{{ currentDetails.name }}</text>
      <text class="qulity">{{ currentDetails.quality?.name }}</text>
      <text class="item-level">物品等级：{{ currentDetails.level }}</text>
      <text class="binding">{{
        currentDetails.preview_item?.binding.name
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
      <text class="requirements"
        >{{
          currentDetails.preview_item?.requirements?.level.display_string
        }}</text
      >
      <text v-show="currentDetails?.description" class="description"
        >“{{ currentDetails.description }}”</text
      >
      <view class="price">
        <view>
          <text>售价：</text>
        </view>
        <view>
          <img src="/static/images/wow/money-gold.gif" alt="" srcset="" />
          <text>{{
            currentDetails.preview_item?.sell_price.display_strings.gold
          }}</text>
        </view>
        <view>
          <img src="/static/images/wow/money-silver.gif" alt="" srcset="" />
          <text>{{
            currentDetails.preview_item?.sell_price.display_strings.silver
          }}</text>
        </view>
        <view>
          <img src="/static/images/wow/money-copper.gif" alt="" srcset="" />
          <text>{{
            currentDetails.preview_item?.sell_price.display_strings.copper
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
          v-show="spell.range && !spell.range?.includes('0码')"
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
</template>

<script lang="ts" setup>
// TODO 后端储存图片
import { onLoad } from '@dcloudio/uni-app';
import { onShareAppMessage } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';

import { ISpceBIS, IBisItem, Relation } from '@/interface/IWow';
import {
  queryBis,
  queryItemPreview,
  querySeasonDungeons,
  IDungeonDTO,
  queryDungeonTip,
  querySpellsInTip,
} from '@/api/wow';

const classKey = ref('');
const specKey = ref('');
const currentData = ref<ISpceBIS | null>();
const query = ref<any>({});
onLoad(async (options: any) => {
  query.value = options;
  classKey.value = options.classKey ?? 'death-knight';
  specKey.value = options.specKey ?? 'blood';

  await getBasicBisData();
  await getSeasonDungeons();
  await getDungeonTip();

  setNaviTitle(options.title);
});

async function getBasicBisData() {
  currentData.value = await queryBis(classKey.value, specKey.value);
  currentTableName.value = currentData.value.bisItems[0]?.title;

  console.log(currentData.value);
}

onShareAppMessage(() => {
  const { title, classKey, specKey } = query.value;

  return {
    title: `BIS - ${title}`,
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
const getRatingText = computed(() => {
  return (score: number) => {
    if (score === 5) {
      return '暴力';
    }
    if (score === 4) {
      return '强力';
    }
    if (score > 1) {
      return '还行';
    }
    return '路边一条';
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

const popup = ref<any>('');
const currentDetails = ref<any>({});
const status = ref('loading');
const currentItem = ref<
  IBisItem | { image: string; id: number; source?: string }
>();
async function switchDetail(
  isShow: boolean,
  item: IBisItem | { image: string; id: number }
) {
  currentDetails.value = {};
  if (isShow) {
    status.value = 'loading';
    popup.value.open(true);

    currentItem.value = item;
    currentDetails.value = await queryItemPreview(item.id);
    if (currentDetails.value) {
      status.value = '';
      console.log(currentDetails.value);
    } else {
      popup.value.open(false);
    }
  }
}

//#region 大秘境TIPS
const dungeons = ref<IDungeonDTO[]>([]);
const dungeonTip = ref<any>();
const currentDungeonId = ref(-1);
const tipCollapseIndex = ref(['0']);
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
async function getDungeonTip() {
  dungeonTip.value = await queryDungeonTip({
    roleClass: classKey.value,
    classSpec: specKey.value,
    dungeonId: currentDungeonId.value,
  });

  console.log(dungeonTip.value);
}
async function switchDungeon(id: number) {
  if (currentDungeonId.value !== id) {
    currentDungeonId.value = id;
    await getDungeonTip();
  }
}

const spellpopup = ref<any>('');
const currentSpells = ref<any>();
async function displaySpells(params: any) {
  const ids = params?.map((item: any) => item.id);
  currentSpells.value = await querySpellsInTip(ids);
  spellpopup.value?.open();
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
  .spell {
    color: $color-uncommon;
  }
  .item-level,
  .description {
    color: $uni-text-color-inverse;
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
      align-items: center;
      image {
        margin-right: 4px;
      }
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
      view {
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
</style>
