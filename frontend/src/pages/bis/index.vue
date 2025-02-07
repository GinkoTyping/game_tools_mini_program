<template>
  <uni-section :class="[classKey]" title="属性优先级">
    <uni-card class="section-card">
      <text :class="[classKey]">{{ currentData?.statsPriority }}</text>
    </uni-card>
  </uni-section>
  <uni-section class="bis" :class="[classKey]" title="BIS配装">
    <uni-card class="section-card">
      <view class="menu">
        <text
          @click="() => switchBisTable('overall')"
          :class="[
            classKey,
            currentTableName === 'overall' ? 'menu_active' : '',
          ]"
          >汇总</text
        >
        <text
          @click="() => switchBisTable('bisItemMythic')"
          :class="[
            classKey,
            currentTableName === 'bisItemMythic' ? 'menu_active' : '',
          ]"
          >大秘境</text
        >
        <text
          @click="() => switchBisTable('bisItemRaid')"
          :class="[
            classKey,
            currentTableName === 'bisItemRaid' ? 'menu_active' : '',
          ]"
          >团本</text
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
                item.isLoot ? 'is-loot' : '',
              ]"
              @click="() => switchWrap(item)"
              >{{ item.source }}</view
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

import { ISpceBIS, IBisItem, ITrinks } from '@/interface/IWow';
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

const currentTableName = ref('overall');
const tableData = computed(() => {
  if (currentTableName.value === 'overall') {
    return currentData.value?.overall ?? [];
  }
  if (currentTableName.value === 'bisItemMythic') {
    return currentData.value?.bisItemMythic ?? [];
  }
  return currentData.value?.bisItemRaid ?? [];
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
