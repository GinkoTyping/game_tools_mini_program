<template>
  <view class="header-filter">
    <view class="left-feature">
      <text
        v-for="feature in featureFilters"
        :key="feature.value"
        class="feature-label"
        :class="[
          currentFeature === feature.value ? ' feature-label--active' : '',
          feature.highlight ? 'feature-label--highlight' : '',
        ]"
        @click="() => switchFeature(feature.value)"
        >{{ feature.title }}</text
      >
    </view>
    <view class="right-drop-down">
      <slot name="right"></slot>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const emits = defineEmits<{
  change: [string];
  // (e: 'change', value: string): void;
}>();
const currentFeature = defineModel('current', {
  type: String,
});
const featureFilters = defineModel('filters', {
  type: Array<{ title: string; value: string; highlight?: boolean }>,
  default: () => [],
});

function switchFeature(value: string) {
  if (currentFeature.value !== value) {
    currentFeature.value = value;
    emits('change', value);
  }
}
</script>

<style lang="scss" scoped>
$header-bg-color: #1d1d1f;

.header-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  z-index: 9;
  top: 0;
  padding: 20rpx;
  width: 100vw;
  box-sizing: border-box;
  color: #bbb;
  background-color: $header-bg-color;

  .left-feature {
    font-size: 24rpx;

    .feature-label {
      margin-right: 24rpx;
    }

    .feature-label--active {
      color: #fff;
      font-size: 26rpx;
    }
    
    .feature-label--highlight {
      position: relative;
      &::after {
        content: '';
        width: 10rpx;
        height: 10rpx;
        background-color: red;
        border-radius: 50%;
        position: absolute;
        right: -8rpx;
        top: -2rpx;
      }
    }
  }

  .right-drop-down {
    display: flex;
    align-items: center;
  }
}
</style>
