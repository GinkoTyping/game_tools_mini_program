<script setup lang="ts">
import { type PropType, ref, computed } from 'vue';

import TalentTree from '@/components/TalentTree/index.vue';
import type { TalentTreeDTO } from '@/api/wow';
import TopMessage from '@/components/TopMessage.vue';

const props = defineProps({
  classKey: String,
  data: {
    type: Object as PropType<TalentTreeDTO>,
    required: true,
  },
});

// region 天赋
const currentBuildIndex = defineModel('active', { type: Number, default: 0 });
const currentPopularTree = computed(() => {
  if (currentPopularTreeIndex.value === 0) {
    return 'class';
  }
  if (currentPopularTreeIndex.value === 1) {
    return 'hero';
  }
  if (currentPopularTreeIndex.value === 2) {
    return 'spec';
  }
  return 'class';
});
const currentPopularTreeIndex = ref(0);
const popularTalentTrees = ['职业天赋树', '英雄天赋树', '专精天赋树'];
const currentHeatMapTree = computed(() => {
  if (currentHeatMapTreeIndex.value === 0) {
    return 'class';
  }
  if (currentHeatMapTreeIndex.value === 1) {
    return 'hero';
  }
  if (currentHeatMapTreeIndex.value === 2) {
    return 'spec';
  }
  return 'class';
});
const currentHeatMapTreeIndex = ref(0);

// TODO 临时处理英雄天赋
const currentHeatMapHeroTreeIdx = ref();
const heroTreeTabs = computed(() => {
  return props.data?.hero_talent_trees.filter(tree => tree.playable_specializations.find(spec => spec.id === props.data?.id));
});

function switchHeatMapHeroTree({ currentIndex }) {
  if (currentHeatMapHeroTreeIdx.value !== currentIndex) {
    currentHeatMapHeroTreeIdx.value = currentIndex;
  }
}

const currentBuild = computed(() => props.data?.talents.talentTreeBuilds?.[currentBuildIndex.value]?.talentTree?.build);

function switchPopularTalentTree({ currentIndex }) {
  if (currentPopularTreeIndex.value !== currentIndex) {
    currentPopularTreeIndex.value = currentIndex;
  }
}

function switchHeatMapTree({ currentIndex }) {
  if (currentHeatMapTreeIndex.value !== currentIndex) {
    currentHeatMapTreeIndex.value = currentIndex;
  }
}

function copyTalentCode() {
  const code = props.data?.talents.talentTreeBuilds?.[currentBuildIndex.value]?.talentTree?.exportCode;

  uni.setClipboardData({
    data: code as string,
    success: function() {
      messageType.value = 'success';
      messageText.value = '已复制天赋树代码';
      messagePopup.value.open();
    },
  });
}

// endregion

// region Popup
const messagePopup = ref();
const messageType = ref('success');
const messageText = ref('默认文本');
// endregion

</script>

<template>
  <!--    英雄天赋选择率-->
  <view class="hero-talent-trend">
    <view class="hero-talent-trend-card"
      v-for="(tree,index) in props.data?.talents.heroTreeStats"
      :key="tree.id"
      :style="{ width: `${index === 0 ? tree.popularity : ''}` }"
    >
      <view v-if="index === 1" class="hero-talent-trend-card__right">
        <view class="hero-talent-bold">{{ tree.popularity }}</view>
        <view>人气</view>
      </view>
      <view class="hero-talent-trend-card__left">
        <view class="hero-talent-trend-card__left__name hero-talent-bold">{{ tree.name }}</view>
        <view class="hero-talent-trend-card__left__popularity">{{ tree.metricValue }}</view>
      </view>
      <view v-if="index === 0" class="hero-talent-trend-card__right">
        <view class="hero-talent-bold">{{ tree.popularity }}</view>
        <view>人气</view>
      </view>
    </view>
  </view>

  <!--  天赋推荐  -->
  <view class="talent" :class="[classKey]">
    <view class="alternative-builds">
      <view class="alternative-build-menu"
        :class="[currentBuildIndex === index ? `alternative-build-menu--active ${classKey}` : '']"
        v-for="(build, index) in props.data?.talents.talentTreeBuilds"
        :key="index"
        @click="currentBuildIndex = index">
        <view class="alternative-build-menu__title">
          {{ build.isDefaultSelection ? '推荐' : `${build.alternativeIndex}#备选` }}
        </view>
        <view class="alternative-build-menu__footer">
          <view>{{ build.popularity }}</view>
          <view>{{ build.keystoneLevel }}+</view>
        </view>
        <view v-show="currentBuildIndex === index" class="iconfont icon-lushichuanshuo"></view>
      </view>
    </view>
    <view class="talent-tree-menus">
      <view class="action-icon" @click="copyTalentCode">
        <view class="iconfont icon-paste2"></view>
        <text>复制</text>
      </view>
      <uni-segmented-control
        :current="currentPopularTreeIndex"
        :values="popularTalentTrees"
        style-type="text"
        active-color="#007aff"
        @clickItem="switchPopularTalentTree"
      />
    </view>
    <TalentTree
      :type="currentPopularTree"
      :data="props.data"
      :selected="currentBuild?.selectedNodes"
      :selected-hero-tree="currentBuild?.heroSpecId"
    />
  </view>

  <!--  天赋 heat map  -->
  <uni-section class="talent" :class="[classKey]" title="天赋点选择率" sub-title="前100玩家">
    <view class="talent-tree-menus">
      <uni-segmented-control
        :current="currentHeatMapTreeIndex"
        :values="popularTalentTrees"
        style-type="text"
        active-color="#007aff"
        @clickItem="switchHeatMapTree"
      />
    </view>

    <view class="talent-tree-menus" v-show="currentHeatMapTreeIndex === 1">
      <uni-segmented-control
        :current="currentHeatMapHeroTreeIdx"
        :values="heroTreeTabs?.map(item => item.name)"
        style-type="text"
        active-color="#007aff"
        @clickItem="switchHeatMapHeroTree"
      />
    </view>

    <TalentTree
      :type="currentHeatMapTree"
      :data="props.data"
      :selected="props.data?.talents.talentHeatMap"
      :selected-hero-tree="heroTreeTabs?.[currentHeatMapHeroTreeIdx]?.id"
      select-type="heat-map"
    />
  </uni-section>

  <TopMessage
    ref="messagePopup"
    v-model:type="messageType"
    v-model:message="messageText"
  />
</template>

<style scoped lang="scss">
// region 天赋
.hero-talent-trend {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  gap: 20rpx;

  .hero-talent-trend-card {
    height: 70rpx;
    border-radius: 16rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10rpx;
    color: #fff;
    font-size: 24rpx;

    .hero-talent-bold {
      font-size: 28rpx;
      font-weight: bold;
    }

    &:first-child {
      background: $color-legend;

      .hero-talent-trend-card__right {
        text-align: right;
      }
    }

    &:last-child {
      min-width: 40%;
      flex: 1;
      background: $color-mythic;

      .hero-talent-trend-card__left {
        text-align: right;
      }
    }
  }
}

.alternative-builds {
  display: flex;
  justify-content: space-between;
  padding: 20rpx;

  .alternative-build-menu {
    box-sizing: border-box;
    padding: 4rpx 8rpx;
    border-radius: 10rpx;
    width: 22%;
    background-color: $uni-bg-color-grey-light;
    position: relative;

    &:not(.alternative-build-menu--active) {
      color: $uni-text-color-grey;
    }

    .alternative-build-menu__title {
      font-size: 28rpx;
    }

    .alternative-build-menu__footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 6rpx;
      font-size: 24rpx;
    }

    .iconfont {
      font-size: 28rpx;
      position: absolute;
      right: 12rpx;
      top: 8rpx;
    }
  }

  .alternative-build-menu--active {
    border: 2rpx solid;

    .alternative-build-menu__title {
      font-weight: bold;
    }
  }
}

.talent-tree-menus {
  position: relative;
  margin-bottom: 30rpx;

  :deep {
    .segmented-text {
      justify-content: center;
    }
  }

  .action-icon {
    position: absolute;
    top: 50%;
    right: 20rpx;
    transform: translate(0, -50%);
    display: flex;
    align-items: center;
    gap: 4rpx;

    text {
      font-size: 28rpx;
    }

    .iconfont {
      font-size: 32rpx;
    }
  }

}

:deep {
  .talent-tree-menus {
    uni-segmented-control {
      & > view {
        justify-content: center;
      }
    }
  }
}

// endregion
</style>
