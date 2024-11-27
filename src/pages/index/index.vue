<template>
  <uni-collapse ref="collapse" accordion>
    <uni-collapse-item v-for="classKey in Object.keys(allData)" :key="classKey">
      <template v-slot:title>
        <view :class="[classKey]">
          {{ localeLabels.class[classKey] }}
        </view>
      </template>
      <view
        class="spec"
        v-for="specItem in bisData[classKey]"
        :key="specItem.spec"
        @click="() => onClickSpec(classKey, specItem.spec)"
      >
        <image :src="specIcon(classKey, specItem.spec)"> </image>
        <text>{{ localeLabels[classKey][specItem.spec] }}</text>
      </view>
    </uni-collapse-item>
  </uni-collapse>
</template>

<script setup lang="ts">
import '@/static/css/index.scss';

import { computed } from 'vue';

import { ILocaleLabels } from '@/interface/ILocaleLabels';
import { IWowBIS } from '@/interface/IWow';
import allData from '@/data/spec-data.json';
import labels from '@/data/zh.json';

const localeLabels = labels as ILocaleLabels;
const bisData = allData as IWowBIS;
const specIcon = computed(
  () => (classKey: string, specKey: string) =>
    `/static/images/specs/${classKey}_${specKey}.gif`
);

function onClickSpec(classKey: string, specKey: string) {
  uni.navigateTo({
    url: `/pages/bis/index?classKey=${classKey}&specKey=${specKey}&title=${localeLabels.class[classKey]} · ${localeLabels[classKey][specKey]}`,
  });
}
</script>

<style lang="scss" scoped>
::v-deep .uni-collapse {
  background-color: $uni-bg-color !important;
}
::v-deep uni-collapse-item {
  width: 100vw;
  .uni-collapse-item__title.uni-collapse-item-border {
    line-height: 40px;
    border-bottom: 4px solid $uni-bg-color-grey;
    padding-left: 32px;
    box-sizing: border-box;
    font-size: 16px;
  }
  .uni-collapse-item__wrap {
    background-color: $uni-bg-color-grey !important;
    .uni-collapse-item__wrap-content {
      border: none !important;
    }
    .spec {
      padding-left: 32px;
      box-sizing: border-box;
      font-size: 16px;
      color: $uni-text-color-inverse;
      line-height: 40px;
      border-bottom: 4px solid $uni-bg-color;
      position: relative;
      image {
        width: 20px;
        height: 20px;
        position: absolute;
        left: 8px;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }
}
</style>
@/interface/IWow
