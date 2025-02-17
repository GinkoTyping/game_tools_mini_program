<template>
  <uni-collapse ref="collapse" accordion>
    <uni-collapse-item
      v-for="(classKey, classIndex) in Object.keys(allData)"
      :key="classKey"
    >
      <template v-slot:title>
        <view :class="[classKey]">
          {{ localeLabels.class[classKey] }}
        </view>
      </template>
      <view
        class="spec"
        v-for="(specItem, specIndex) in bisData[classKey]"
        :key="specItem.spec"
        @click="() => onClickSpec(classKey, specItem.spec)"
      >
        <view
          :style="{
            width: '20px',
            height: '20px',
            backgroundImage:
              'url(https://ginkolearn.cyou/api/wow/assets/sprites/spec-sprite.png)',
            backgroundPosition: `${-specIndex * 20}px ${-classIndex * 20}px`,
          }"
        ></view>
        <text>{{ localeLabels[classKey][specItem.spec] }}</text>
      </view>
    </uni-collapse-item>
  </uni-collapse>

  <view :class="popoverClass">
    <image
      class="popup-icon"
      src="/static/images/common/a-sahua1.png"
      style="transform: scaleX(-1)"
    ></image>
    <text
      >银子的搜罗坊，本日已被访问
      <text style="font-weight: bolder">{{ accessCount }}</text> 次</text
    >
    <image class="popup-icon" src="/static/images/common/a-sahua1.png"></image>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';

import '@/static/css/index.scss';
import { ILocaleLabels } from '@/interface/ILocaleLabels';
import { IWowBIS } from '@/interface/IWow';
import allData from '@/data/spec-data.json';
import labels from '@/data/zh.json';
import { getAccessCount } from '@/api/shared';

onShareAppMessage(() => ({
  title: 'WOW BIS 查询',
  path: 'pages/index/index',
}));

onLoad(async () => {
  accessCount.value = await getAccessCount();
  setAccessPopoverCountDown();
});
const accessCount = ref<any>('');
const popoverClass = ref(['popup-container', 'animate__animated']);
function setAccessPopoverCountDown() {
  if (!popoverClass.value.includes('animate__fadeInUp')) {
    popoverClass.value.push('animate__fadeInUp');
  }
  let timer: any = setTimeout(() => {
    if (popoverClass.value.includes('animate__fadeInUp')) {
      popoverClass.value.pop();
      popoverClass.value.push('animate__fadeOut');
    }
    timer = null;
  }, 5000);
}

const localeLabels = labels as ILocaleLabels;
const bisData = allData as IWowBIS;

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
      view {
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
.popup-icon {
  height: 20px;
  width: 20px;
}

.popup-container {
  width: 100vw;
  position: fixed;
  display: flex;
  justify-content: center;
  bottom: 0 !important;
  background-color: #a1ffb3;
  align-items: center;
  height: 40px;
  text {
    padding: 0 4px;
    color: #3aa239;
  }
}
</style>
