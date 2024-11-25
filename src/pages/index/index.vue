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
      >
        {{ localeLabels[classKey][specItem.spec] }}
      </view>
    </uni-collapse-item>
  </uni-collapse>
</template>

<script setup lang="ts">
import "@/static/css/index.scss";
import { ref } from "vue";

import { ILocaleLabels } from "@/interface/ILocaleLabels";
import { IWowBIS } from "@/interface/IWowBIS";
import allData from "@/data/spec-data.json";
import labels from "@/data/zh.json";

const localeLabels = labels as ILocaleLabels;
const bisData = allData as IWowBIS;
</script>

<style lang="scss" scoped>
::v-deep .uni-collapse {
  background-color: $uni-bg-color !important;
}
::v-deep uni-collapse-item {
  width: 100vw;
  .uni-collapse-item__title.uni-collapse-item-border {
    line-height: 40px;
    border-bottom: 2px solid $uni-bg-color-grey;
    padding-left: 32px;
    box-sizing: border-box;
    font-size: 16px;
  }
  .uni-collapse-item__wrap {
    padding-left: 32px;
    box-sizing: border-box;
    background-color: $uni-bg-color-grey !important;
    .spec {
      font-size: 16px;
      color: $uni-text-color-inverse;
      line-height: 40px;
    }
  }
}
</style>
