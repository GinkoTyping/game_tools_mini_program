<template>
  <uni-section class="mb-10" :class="[classKey]" title="属性优先级">
    <uni-card>
      <text :class="[classKey]">{{ currentData?.statsPriority }}</text>
    </uni-card>
  </uni-section>
  <uni-section class="mb-10" :class="[classKey]" title="BIS配装">
    <uni-card>
      <view class="menu">
        <text>汇总</text>
        <text>大秘境</text>
        <text>团本</text>
      </view>

      <uni-table ref="table" stripe emptyText="暂无更多数据">
        <uni-tr>
          <uni-th width="40" align="left">部位</uni-th>
          <uni-th width="80" align="left">装备</uni-th>
          <uni-th width="80" align="left">来源</uni-th>
        </uni-tr>
        <uni-tr v-for="(item, index) in currentData?.overall" :key="index">
          <uni-td>{{ item.slot }}</uni-td>
          <uni-td>{{ item.item }}</uni-td>
          <uni-td>{{item.source}}</uni-td>
        </uni-tr>
      </uni-table>
    </uni-card>
  </uni-section>
</template>

<script lang="ts" setup>
// TODO menu菜单样式
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';

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

  console.log(currentData.value);
});
</script>

<style lang="scss">
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
  border: 2px rgb(68, 68, 68) solid;
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
</style>
