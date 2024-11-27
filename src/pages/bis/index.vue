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
          <uni-th width="40" align="left">部位</uni-th>
          <uni-th width="80" align="left">装备</uni-th>
          <uni-th width="80" align="left">来源</uni-th>
        </uni-tr>
        <uni-tr v-for="(item, index) in tableData" :key="index">
          <uni-td>{{ item.slot }}</uni-td>
          <uni-td>{{ item.item }}</uni-td>
          <uni-td>{{ item.source }}</uni-td>
        </uni-tr>
      </uni-table>
    </uni-card>
  </uni-section>
</template>

<script lang="ts" setup>
// TODO row默认只展示一行，点击展示两行
import { onLoad } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';

import { IWowBIS, ISpceBIS } from '@/interface/IWow';
import { mapSpecData } from '@/data/mapSpecData';

const bisData: IWowBIS = mapSpecData();

const classKey = ref('');
const specKey = ref('');
const currentData = ref<ISpceBIS | null>();
onLoad((options: any) => {
  classKey.value = options.classKey ?? 'death-knight';
  specKey.value = options.specKey ?? 'blood';
  currentData.value = bisData[classKey.value].find(
    item => item.spec === specKey.value
  );

  setNaviTitle(options.title);

  console.log(currentData.value);
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
    border-bottom: 1px $uni-bg-color solid !important;
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
    }
    &:nth-child(3) {
      color: $uni-text-color-inverse;
    }
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
</style>
