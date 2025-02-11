<template>
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
                :src="`/static/images/wow/items/${item.image}`"
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
              :src="`/static/images/wow/trinkets/${trinket.image}`"
              alt=""
              srcset=""
            />
          </view>
        </view>
      </view>
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
</template>

<script lang="ts" setup>
// TODO 后端储存图片
import { onLoad } from '@dcloudio/uni-app';
import { onShareAppMessage } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';

import { ISpceBIS, IBisItem, ITrinks, Relation } from '@/interface/IWow';
import { queryBis, queryItemPreview } from '@/api/wow';

const classKey = ref('');
const specKey = ref('');
const currentData = ref<ISpceBIS | null>();
const query = ref<any>({});
onLoad(async (options: any) => {
  query.value = options;

  classKey.value = options.classKey ?? 'death-knight';
  specKey.value = options.specKey ?? 'blood';
  currentData.value = await queryBis(classKey.value, specKey.value);
  currentTableName.value = currentData.value.bisItems[0]?.title;
  console.log(currentData.value);

  setNaviTitle(options.title);
});

onShareAppMessage(() => {
  const { title, classKey, specKey } = query.value;

  return {
    title: `BIS - ${title}`,
    path: `pages/bis/index?classKey=${classKey}&specKey=${specKey}&title=${title}`,
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
  return currentData.value?.bisItems.find(item => item.title === currentTableName.value)?.items;
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
</script>

<style lang="scss" scoped>
page {
  background-color: red;
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
  text {
    color: #fff;
  }
  .uni-card__content {
    display: flex;
    flex-direction: column;
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
  .disale-ellipsis {
    white-space: normal !important;
  }
  .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.bis .menu {
  margin-bottom: 10px;
  .menu_active {
    color: #ffffff;
    border-bottom: 4px red sol;
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
