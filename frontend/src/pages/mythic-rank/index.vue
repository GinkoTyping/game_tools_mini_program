<script setup lang="ts">

import { computed, getCurrentInstance, nextTick, ref } from 'vue';
import { queryMythicRankList, queryMythicRankRatio } from '@/api/wow';
import { onLoad } from '@dcloudio/uni-app';
import { getClassIconURL } from '@/hooks/imageGenerator';

const rankRatio = ref<any>([]);
const getSpecBgImg = computed(() => {
  return (item) => {
    let roleClass = item.character.class.slug;
    const classSpec = item.character.spec.slug;
    if (roleClass === 'demon-hunter') {
      roleClass = 'dh';
    } else if (roleClass === 'death-knight') {
      roleClass = 'dk';
    }
    return `https://ginkolearn.cyou/api/wow/assets/class-bgs/${roleClass}-${classSpec}-spec-background.webp`;
  };
});

// region 虚拟列表
const vListRef = ref();
const virtualList = ref();

const getColorByRank = computed(() => {
  return (rank: number) => {
    if (rank <= 3) {
      return '#d32121';
    }
    if (rank <= 10) {
      return '#e37e00';
    }
    if (rank <= 100) {
      return '#f3d037';
    }
    return '';
  };
});

function virtualListChange(vList) {
  virtualList.value = vList;
}

function getHeightByClass() {
  // 创建节点查询器
  const query = uni.createSelectorQuery().in(getCurrentInstance());
  console.log('获取高度');
  query.select('.main')  // 根据 class 名查找节点
    .boundingClientRect(rect => {
      if (rect) {
        console.log('获取高度成功', rect.height);
      } else {
        console.error('获取高度失败：节点未找到');
      }
    }).exec();
}

const tableCache = ref();

async function queryList(pageNo: number, pageSize: number, from: string) {
  const data: any = await queryMythicRankList(pageNo);

  if (from === 'load-more' && tableCache.value?.data) {
    tableCache.value.data.push(...data.data);
  } else {
    tableCache.value = data;
  }

  // 不深拷贝会造成更新异常
  vListRef.value?.complete([...data.data]);
}

// endregion

onLoad(async () => {
  rankRatio.value = await queryMythicRankRatio();

  await nextTick(() => {
    vListRef.value?.reload?.();
    getHeightByClass();
  });
});

</script>

<template>
  <view class="main">
    <view id="rank-ratio">
      <view
        class="rank-ratio-item"
        :class="[`rank-ratio-item--level-${index}`]"
        v-for="(rankItem, index) in rankRatio"
        :key="index"
      >
        <image :src="getSpecBgImg(rankItem)" />
        <view class="rank-ratio-item__header">
          <text>{{ Math.ceil(rankItem.score) }}</text>
          <text class="rank-ratio-item__header-unit">分</text>
        </view>
        <view class="rank-ratio-item__footer">
          <view class="rank-ratio-item__footer-percentage">前{{ rankItem.percentage * 100 }}%</view>
          <view class="rank-ratio-item__footer-rank">第{{ rankItem.rank }}名</view>
        </view>
      </view>
    </view>

    <z-paging
      ref="vListRef"
      :auto="false"
      use-virtual-list
      cell-height-mode="fixed"
      fixed-cell-height="68rpx"
      :default-page-size="40"
      :force-close-inner-list="true"
      @virtualListChange="virtualListChange"
      @query="queryList"
    >
      <template #top>
        <view class="table-header tr">
          <view class="td">排名</view>
          <view class="td">角色</view>
          <view class="td">服务器</view>
          <view class="td">分数</view>
        </view>
      </template>
      <view class="custom-table">
        <view
          class="tr"
          :id="`zp-id-${item.zp_index}`"
          :key="item.zp_index"
          v-for="(item) in virtualList"
        >
          <view class="td" :style="{ color: getColorByRank(item.rank) }">{{ item.rank }}</view>
          <view class="td">
            <image
              class="spec-icon"
              v-if="item.character?.class?.slug && item.character?.spec?.slug"
              :src="getClassIconURL(item.character?.class?.slug, item.character?.spec?.slug)"
            />
            <view class="spec-icon" v-show="!item.character?.class?.slug || !item.character?.spec?.slug">
              ?
            </view>
            <view :class="[item.character?.class?.slug]">{{ item.character?.name }}</view>
          </view>
          <view class="td">{{ item.character?.realm?.altName }}</view>
          <view class="td td-score">{{ item.score?.toFixed(1) }}</view>
        </view>
      </view>
    </z-paging>

    <ad-custom class="bottom-ad" unit-id="adunit-4e98523929883144"></ad-custom>
  </view>

</template>

<style scoped lang="scss">


.main {
  padding: 20rpx 20rpx 0 20rpx;
}

#rank-ratio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40rpx;

  .rank-ratio-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border-radius: 12rpx;
    background-color: transparent;
    height: 120rpx;
    position: relative;
    overflow: hidden;
    border: 2rpx solid #6d6d6d;
    padding: 10rpx;
    box-sizing: border-box;

    image {
      z-index: -1;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      scale: -1 1;
      mask-image: linear-gradient(-90deg, transparent 6%, rgb(0, 0, 0) 90%);
    }

    .rank-ratio-item__header {
      font-size: $uni-font-size-lg;
      font-weight: bold;

      .rank-ratio-item__header-unit {
        font-size: $uni-font-size-sm;

      }
    }

    .rank-ratio-item__footer {
      display: flex;
      align-items: center;
      gap: 8rpx;
      font-size: $uni-font-size-sm;

      .rank-ratio-item__footer-rank {
        color: $uni-text-color-grey;
      }
    }
  }

  .rank-ratio-item--level-0 {
    color: $color-s-tier;
  }

  .rank-ratio-item--level-1 {
    color: $color-a-tier;
  }

  .rank-ratio-item--level-2 {
    color: $color-b-tier;
  }
}

::v-deep .z-paging-content {
  top: 140rpx !important;
  padding: 0 20rpx;
  height: calc(100vh - 140rpx - 260rpx) !important;
  color: $uni-text-color-grey;

  .table-header {
    font-size: $uni-font-size-base;
    font-weight: bold;
    color: #fff;
  }

  .tr {
    display: flex;
    height: 68rpx;

    .td:first-child {
      flex: none;
      width: 120rpx;
    }

    .td:last-child {
      flex: none;
      width: 120rpx;
    }
  }

  .td {
    height: 100%;
    font-size: $uni-font-size-sm;
    flex: 1;
    text-align: center;
    display: flex;
    align-items: center;
    gap: 10rpx;

    .spec-icon {
      height: 40rpx;
      width: 40rpx;
      background-color: $uni-text-color-grey;
      border-radius: 4rpx;
      color: #fff;
      line-height: 40rpx;
    }
  }

  .td-score {
    font-weight: bold;
    color: $color-a-tier;
  }
}

.bottom-ad {
  width: 100vw;
  position: fixed;
  bottom: 0;
  left: 0;
}
</style>
