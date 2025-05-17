<template>
  <z-paging
    ref="vListRef"
    :auto="false"
    use-virtual-list
    cell-height-mode="fixed"
    fixed-cell-height="68rpx"
    :default-page-size="30"
    :force-close-inner-list="true"
    @virtualListChange="virtualListChange"
    @query="queryList"
  >
    <template #top>
      <view class="tr">
        <view
          class="td"
          v-for="(column, index) in displayColumns(
            tableCache?.columns,
            tableCache?.columnDisplay
          )"
          :key="column"
        >
          <view>{{ column }}</view>
        </view>
      </view>
    </template>
    <view class="custom-table">
      <view
        class="tr"
        :id="`zp-id-${item.zp_index}`"
        :key="item.zp_index"
        v-for="(item, index) in virtualList"
      >
        <view
          class="td"
          v-for="propKey in tableCache?.rowDisplay"
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
        </view>
      </view>
    </view>
  </z-paging>
</template>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app';
import { nextTick, reactive, ref } from 'vue';

import { queryLadder } from '@/api/poe';
import { useLadderTable } from '@/pages-poe/hooks/poe/ladderTable';

const { accountColor, classIconUrl, displayColumns } = useLadderTable();
const options = reactive({ type: '', name: '' });
onLoad(async query => {
  options.type = query?.type || 'standard';
  options.name = query?.name || '';
  uni.setNavigationBarTitle({
    title: `天梯 ${options.name}`,
  });
  nextTick(() => {
    vListRef.value?.reload?.();
  });
});

const vListRef = ref();
const virtualList = ref();

function virtualListChange(vList) {
  virtualList.value = vList;
}

const tableCache = ref();

async function queryList(pageNo: number, pageSize: number, from: string) {
  if (options.type) {
    const lastRank = from === 'load-more' ? tableCache.value?.data?.slice(-1)[0].rank : 0;
    const data = await queryLadder({
      pageSize,
      lastRank,
      type: options.type,
    });

    if (from === 'load-more' && tableCache.value?.data) {
      tableCache.value.data.push(...data.data);
    } else {
      tableCache.value = data;
    }

    console.log(from, data.data);

    // 不深拷贝会造成更新异常
    vListRef.value?.complete([...data.data]);
  }
}
</script>

<style lang="scss" scoped>
$light-border: rgb(68, 68, 68);

:deep(.custom-table) {
  background-color: rgb(40, 40, 40) !important;
  box-sizing: border-box;
}

.tr {
  display: table-row;
  box-sizing: border-box;
  height: 68rpx;
}

.uni-table-th,
.td {
  display: table-cell;
  font-size: 14px;
  font-weight: 400;
  color: #606266;
  line-height: 23px;
  box-sizing: border-box;
  border-bottom: 1px $uni-bg-color solid !important;
}

.uni-table-th {
  font-weight: normal;
  font-size: 26rpx !important;
  padding: 16rpx 4rpx !important;
  color: #bbb;
}

.td {
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
      width: calc(100vw - 200px) !important;
    }
  }

  &:nth-child(3) {
    view {
      justify-content: flex-start !important;
      width: 100px !important;
    }
  }
}
</style>
