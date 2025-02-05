<template>
  <uni-section :class="[classKey]" title="属性优先级">
    <uni-card>
      <text :class="[classKey]">{{ currentData?.statsPriority }}</text>
    </uni-card>
  </uni-section>
  <uni-section class="bis" :class="[classKey]" title="BIS配装">
    <uni-card>
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
                @click="() => switchWrap(item)"
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
    <uni-card>
      <view class="tier" v-for="(tier, index) in currentData?.trinkets">
        <view class="tier-label" :data-label="index">
          <text>{{ tier.label }}</text>
        </view>
        <view class="trink-container">
          <view class="trink" v-for="trinket in tier.trinkets" :key="trinket">
            <img :src="`/static/images/trinkets/${trinket}`" alt="" srcset="" />
          </view>
        </view>
      </view>
    </uni-card>
  </uni-section>
</template>

<script lang="ts" setup>
// TODO 后端储存图片
import { onLoad } from '@dcloudio/uni-app';
import { onShareAppMessage } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';

import { ISpceBIS, IBisItem } from '@/interface/IWow';
import { queryBis } from '@/api/wow';

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
</script>

<style lang="scss">
$light-border: rgb(68, 68, 68);
::v-deep uni-section {
  .uni-section-header {
    background-color: $uni-bg-color-grey;
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
      background-color: rgb(244, 123, 0);
    }
    &[data-label='1'] {
      background-color: rgb(152, 50, 221);
    }
    &[data-label='2'] {
      background-color: rgb(2, 103, 200);
    }
    &[data-label='3'] {
      background-color: rgb(29, 245, 1);
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
