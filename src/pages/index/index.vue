<template>
  <view class="content">
    <uni-collapse ref="collapse" accordion>
      <uni-collapse-item
        :title="localeLabels.class[classKey]"
        v-for="classKey in Object.keys(allData)"
        :key="classKey"
      >
        <view class="content" v-for="specItem in bisData[classKey]" :key="specItem.spec">
          {{ localeLabels[classKey][specItem.spec] }}
        </view>
      </uni-collapse-item>
    </uni-collapse>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { ILocaleLabels } from "@/interface/ILocaleLabels";
import { IWowBIS } from "@/interface/IWowBIS";
import allData from "@/data/spec-data.json";
import labels from "@/data/zh.json";

const localeLabels = labels as ILocaleLabels;
const bisData = allData as IWowBIS;
</script>

<style scoped>
uni-collapse-item {
  width: 100vw;
}
::v-deep .uni-collapse-item__title-text {
  text-align: center !important;
}
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
