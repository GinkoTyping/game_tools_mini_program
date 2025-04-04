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
          <text class="iconfont icon-weidu-01"></text>
          <view>查看更多</view>
        </view>
      </template>
      <view class="table-container">
        <uni-table ref="table" emptyText="暂无更多数据">
          <uni-tr>
            <uni-th
              align="center"
              v-for="(column, index) in displayColumns"
              :key="column"
              width="30"
              >{{ column }}</uni-th
            >
          </uni-tr>
          <uni-tr v-for="(item, index) in ladder.data" :key="index">
            <uni-td
              v-for="propKey in ladders.rowDisplay"
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

import { getTopLadders } from '@/api/poe';
import ShareIcon from '@/components/ShareIcon.vue';
import { calculateRelativeTime } from '@/utils/time';

const ladders = ref();
onLoad(async () => {
  ladders.value = await getTopLadders();
});

//#region 样式
const displayColumns = computed(() => {
  return ladders.value?.columns.filter(
    (column, index) => ladders.value?.columnDisplay[index]
  );
});
const accountColor = computed(() => {
  return index => {
    if (index === 0) {
      return '#d32121';
    } else if (index <= 2) {
      return '#e37e00';
    } else if (index <= 5) {
      return '#f3d037';
    } else if (index <= 10) {
      return '#c4ff6b';
    } else if (index <= 20) {
      return '#8092f1';
    } else {
      return 'rgb(221, 221, 221)';
    }
  };
});
const classIconUrl = computed(() => {
  return className =>
    `https://ginkolearn.cyou/api/poe/assets/class-thumb/${className
      .toLowerCase()
      .replaceAll(' ', '-')}.webp`;
});
const relativeUpdateTime = computed(() => {
  if (ladders.value?.time) {
    return `更新: ${calculateRelativeTime(ladders.value.time)}`;
  }
  return null;
});
//#endregion
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
    gap: 8rpx;
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
</style>
