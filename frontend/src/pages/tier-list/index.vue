<template>
  <uni-collapse ref="collapse">
    <uni-collapse-item v-for="item in tierList?.tier_data" :key="item.tier">
      <template v-slot:title>
        <view class="collapse-title">
          <text class="collapse-title__tier">{{ item.tier }}</text>
          <text class="collapse-title__tier--suffix">级</text>
        </view>
      </template>
      <view class="collapse-content">
        <view
          class="collapse-content__card"
          v-for="spec in item.children"
          :key="spec.fullNameEn"
          :style="{
            backgroundImage: `url(${getClassIconURL(
              spec.roleClass,
              spec.classSpec
            )})`,
          }"
        >
        </view>
      </view>
    </uni-collapse-item>
  </uni-collapse>
</template>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app';
import { queryTierList } from '@/api/wow/index';
import { ref } from 'vue';

import { getClassIconURL } from '@/hooks/imageGenerator';

const tierList = ref();
onLoad(async () => {
  tierList.value = await queryTierList({
    versionId: '11.1.0 - PTR',
    activityType: 'MYTHIC',
    role: 'DPS',
  });
});
</script>

<style lang="scss" scoped>
// TODO 和 index/index 页面的样式有冗余
::v-deep uni-collapse-item {
  &:nth-child(1) {
    background-color: $color-s-tier !important;
  }
  &:nth-child(2) {
    background-color: $color-a-tier !important;
  }
  &:nth-child(3) {
    background-color: $color-b-tier !important;
  }
  &:nth-child(4) {
    background-color: $color-c-tier !important;
  }
  &:nth-child(5) {
    background-color: $color-d-tier !important;
  }
  .uni-collapse-item__title.uni-collapse-item-border {
    line-height: 40px;
    border-bottom: 4px solid $uni-bg-color-grey;
    padding-left: 32px;
    box-sizing: border-box;
    font-size: 16px;
    .uni-collapse-item--animation text {
      color: $uni-bg-color-grey !important;
    }
  }
  .uni-collapse-item__wrap {
    background-color: $uni-bg-color-grey !important;
    .uni-collapse-item__wrap-content {
      border: none !important;
    }
  }
}

.collapse-title {
  color: $uni-bg-color;
  font-family: Impact, Haettenschweiler;
  display: flex;
  align-items: baseline;
  .collapse-title__tier {
    width: 20px;
    font-size: large;
    margin-right: 0.2rem;
    display: block;
  }
}
.collapse-content__card {
  width: 17.5vw;
  height: 17.5vw;
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
