<template>
  <uni-section
    v-for="ladder in ladders?.data"
    :key="ladder.label"
    id="server"
    class="priest"
    :title="ladder.label"
    :subTitle="ladder.desc"
    type="line"
    titleFontSize="16px"
  >
    <template v-slot:right>查看更多</template>
    <view class="table-container">
      <uni-table ref="table" stripe emptyText="暂无更多数据">
        <uni-tr>
          <uni-th
            align="center"
            v-for="(column, index) in displayColumns"
            :key="column"
            width="30"
            >{{ column }}</uni-th
          >
        </uni-tr>
        <uni-tr v-for="(item, index) in ladder.data.slice(0, 10)" :key="index">
          <uni-td
            v-for="(value, valueIdx) in displayValues(item)"
            align="center"
            :key="valueIdx"
          >
            <view :class="[`td-${valueIdx}`, 'ellipsis']">{{ value }}</view>
          </uni-td>
        </uni-tr>
      </uni-table>
    </view>
  </uni-section>
</template>

<script lang="ts" setup>
import { getLadders } from '@/api/poe';
import { onLoad } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';

const ladders = ref();
onLoad(async () => {
  ladders.value = await getLadders();
});

const displayColumns = computed(() => {
  return ladders.value?.columns.filter(
    (column, index) => ladders.value?.showIndex[index]
  );
});
const displayValues = computed(() => {
  return row => {
    return row.filter((value, idx) => ladders.value?.showIndex[idx]);
  };
});
</script>

<style lang="scss" scoped>
.table-container {
  padding: 0 20rpx;
}

$light-border: rgb(68, 68, 68);
::v-deep .uni-table {
  background-color: rgb(40, 40, 40) !important;
  border: 2px $light-border solid;
  box-sizing: border-box;
  .uni-table-th,
  .uni-table-td {
    border-bottom: 1px $uni-bg-color solid !important;
  }

  .uni-table-th {
    font-weight: normal;
    font-size: 26rpx !important;
    padding: 16rpx 4rpx !important;
    color: #bbb;
  }
  .uni-table-td {
    font-weight: 400;
    padding: 0 !important;
    > view {
      font-size: 26rpx !important;
      padding: 8rpx 4rpx !important;
      box-sizing: border-box;
      text-align: center;
      color: rgb(221, 221, 221);
    }
    &:first-child,
    &:nth-child(4) {
      view {
        width: 50px !important;
      }
    }
    &:nth-child(2) {
      view {
        color: rgb(163, 53, 238) !important;
        width: calc(100vw - 200px - 24px) !important;
      }
    }
    &:nth-child(3) {
      view {
        width: 100px !important;
      }
    }
  }
}
</style>
