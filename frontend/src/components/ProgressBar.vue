<template>
  <view class="progress-bar-container">
    <view class="progress-text-left">当前：{{ current }}</view>
    <view class="progress-text-right">总共：{{ props.total }}</view>
    <view
      class="bar-item"
      :style="{ width: barWidth }"
      v-for="(item, index) in new Array(current).fill(null)"
      :key="index"
    >
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
  total: {
    type: Number,
    default: 5,
  },
});
const current = defineModel('current', { type: Number, default: 0 });
const barWidth = computed(() => `${((1 / props.total) * 100).toFixed(2)}%`);
</script>

<style lang="scss" scoped>
.progress-bar-container {
  display: flex;
  height: 60rpx;
  background-color: $uni-bg-color-grey-lighter;
  position: relative;
  .bar-item {
    background-color: $uni-color-primary;
    box-sizing: border-box;
    height: 100%;
    position: relative;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    color: #fff;
    font-weight: bold;
    padding-right: 10rpx;
    font-size: 14px;
    &:last-child {
      border-top-right-radius: 20rpx;
      border-bottom-right-radius: 20rpx;
    }
  }
  .progress-text-left,
  .progress-text-right {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-weight: bold;
    z-index: 2;
  }
  .progress-text-left {
    left: 2vw;
    color: $uni-text-color-inverse;
  }
  .progress-text-right {
    right: 2vw;
    color: #fff;
  }
}
</style>
