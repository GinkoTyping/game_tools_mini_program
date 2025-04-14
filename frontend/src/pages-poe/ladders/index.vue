<template>
  <view class="ladders-container">
    <uni-section
      v-for="ladder in ladders?.data"
      :key="ladder.label"
      id="server"
      class="priest"
      :title="ladder.label"
      :subTitle="relativeUpdateTime"
      type="line"
      titleFontSize="16px"
    >
      <template v-slot:right>
        <view class="slot-right">
          <view
            v-if="hasAscendancyRank(ladder.key)"
            class="icon-wrap"
            @click="() => switchDisplayType(ladder.key)"
          >
            <text class="iconfont icon-rankfill"></text>
            <view>升华</view>
          </view>
          <view
            class="icon-wrap"
            @click="() => navigator.toPoeDeatilLadder(ladder.key, ladder.label)"
          >
            <text class="iconfont icon-weidu-01"></text>
            <view>更多</view>
          </view>
        </view>
      </template>
      <LadderTable
        v-show="displayType(ladder.key) === 'table'"
        v-model:data="ladder.data"
        :columns="ladders.columns"
        :row-display="ladders.rowDisplay"
        :column-display="ladders.columnDisplay"
      />

      <view v-show="displayType(ladder.key) === 'rank'" class="ascendancy">
        <view
          class="ascendancy-row"
          v-for="item in getAscendancyByType(ladder.key)"
        >
          <image :src="classIconUrl(item.ascendancyEn)" mode="widthFix" />
          <view class="ascendancy-row__bg">
            <view
              class="ascendancy-row__bg-fill"
              :class="`poe-${item.class}-bg`"
              :style="{ width: item.percentage }"
              >{{ item.ascendancy }}({{ item.count }}人)</view
            >
          </view>
        </view>
      </view>
    </uni-section>
  </view>

  <view class="ad-container">
    <ad-custom unit-id="adunit-d8d033f3e30a86cf"></ad-custom>
  </view>

  <ShareIcon />
</template>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';

import {
  getTopLadders,
  IAscendancyLadderData,
  queryAscendancyLadders,
} from '@/api/poe';
import { calculateRelativeTime } from '@/utils/time';
import { useNavigator } from '@/hooks/navigator';
import ShareIcon from '@/components/ShareIcon.vue';
import LadderTable from '@/components/poe/LadderTable.vue';
import { useLadderTable } from '@/hooks/poe/ladderTable';

const navigator = useNavigator();
const ladders = ref();
const ascendancyRank = ref<IAscendancyLadderData[]>();
onLoad(async () => {
  ladders.value = await getTopLadders();
  ascendancyRank.value = await queryAscendancyLadders();
});

//#region 样式
const displayColumns = computed(() => {
  return ladders.value?.columns.filter(
    (column, index) => ladders.value?.columnDisplay[index]
  );
});
const relativeUpdateTime = computed(() => {
  if (ladders.value?.time) {
    return `更新: ${calculateRelativeTime(ladders.value.time)}`;
  }
  return null;
});
const hasAscendancyRank = computed(() => {
  return (key: string) => ascendancyRank.value?.some(item => item.type === key);
});
const displayType = computed(() => {
  return (key: string) =>
    ascendancyRank.value?.find(item => item.type === key)?.display
      ? 'rank'
      : 'table';
});
const getAscendancyByType = computed(() => {
  return (key: string) =>
    ascendancyRank.value?.find(item => item.type === key)?.rankData as any;
});
const { classIconUrl } = useLadderTable();
//#endregion

function switchDisplayType(key: string) {
  const found = ascendancyRank.value?.find(item => item.type === key);
  if (found) {
    found.display = !found.display;
  }
}
</script>

<style lang="scss" scoped>
.ad-container {
  position: fixed;
  bottom: 42rpx;
  left: 40rpx;
  z-index: 2;
}

.ladders-container {
  padding-bottom: 230rpx;

  .slot-right {
    color: $uni-color-primary;
    display: flex;
    align-items: center;
    gap: 16rpx;

    > view {
      padding: 14rpx 0;
    }
    .icon-wrap {
      display: flex;
      align-items: center;
      gap: 8rpx;
    }
  }
}

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

.ascendancy {
  padding: 0 20rpx;
  .ascendancy-row {
    display: flex;
    align-items: center;
    border-bottom: 1px $uni-bg-color solid !important;
    image {
      width: 50rpx;
    }
    .ascendancy-row__bg {
      height: 50rpx;
      line-height: 50rpx;
      flex: 1;
      background-color: $uni-bg-color-grey-lighter;
      .ascendancy-row__bg-fill {
        padding: 0 10rpx;
        box-sizing: border-box;

        overflow: visible;
        white-space: nowrap;
      }
    }
  }
}
</style>
