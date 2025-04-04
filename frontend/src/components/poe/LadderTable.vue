<template>
  <view class="table-container">
    <uni-table ref="table" emptyText="暂无更多数据">
      <uni-tr>
        <uni-th
          align="center"
          v-for="(column, index) in displayColumns(
            props.columns,
            props.columnDisplay
          )"
          :key="column"
          width="30"
          >{{ column }}</uni-th
        >
      </uni-tr>
      <uni-tr v-for="(item, index) in tableData" :key="index">
        <uni-td
          v-for="propKey in props.rowDisplay"
          align="center"
          :key="propKey"
        >
          <view :style="{ color: accountColor(index) }">
            <image
              v-if="propKey === 'class_name'"
              :src="classIconUrl(item['class_name_en'])"
              mode="widthFix"
            />
            <text class="ellipsis">{{ item[propKey] }}</text>
          </view>
        </uni-td>
      </uni-tr>
    </uni-table>
  </view>
</template>

<script lang="ts" setup>
import { useLadderTable } from '@/hooks/poe/ladderTable';

const tableData = defineModel('data', { type: Array });
const props = defineProps({
  columns: Array<String>,
  rowDisplay: Array<String>,
  columnDisplay: Array<String>,
});
const { accountColor, classIconUrl, displayColumns } = useLadderTable();
</script>

<style lang="scss" scoped>
.table-container {
  padding: 0 20rpx;
}

$light-border: rgb(68, 68, 68);

:deep(.uni-table) {
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
    vertical-align: middle;
    text-align: center;

    > view {
      font-size: 26rpx !important;
      padding: 8rpx 4rpx !important;
      box-sizing: border-box;
      text-align: center;
      color: rgb(221, 221, 221);
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10rpx;

      image {
        width: 50rpx;
        border-radius: 10rpx;
      }
    }

    &:first-child,
    &:nth-child(4) {
      view {
        width: 50px !important;
      }
    }

    &:nth-child(2) {
      view {
        width: calc(100vw - 200px - 24px) !important;
      }
    }

    &:nth-child(3) {
      view {
        justify-content: flex-start !important;
        width: 100px !important;
      }
    }
  }
}
</style>
