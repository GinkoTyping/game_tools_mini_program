<template>
  <uni-transition
    ref="ani"
    custom-class="transition"
    mode-class="fade"
    :show="visible"
    ><view class="message-tip">
      {{ message }}
    </view></uni-transition
  >
</template>

<script setup>
import { ref } from 'vue';

const visible = ref(false);
const message = ref('');

function showToast(msg) {
  message.value = msg;
  visible.value = true;
  setTimeout(() => (visible.value = false), 2000);
}
defineExpose({ showToast });
</script>

<style lang="scss" scoped>
.message-tip {
  /* 定位：水平垂直居中 */
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999; /* 确保悬浮于其他内容之上 */

  /* 背景样式 */
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8rpx;
  padding: 16rpx 32rpx;

  /* 文字样式 */
  color: #fff;
  font-size: 28rpx;
  line-height: 1.5;
  text-align: center;

  /* 动画效果 */
  animation: tip-fade 1s ease;

  /* 阴影增强层次感 */
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
}
</style>
