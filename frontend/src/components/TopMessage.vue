<template>
  <view
    ref="messageContainer"
    class="top-message animate__animated"
    :class="[
      type,
      isInit ? 'init-state' : '',
      isOpen ? 'animate__fadeInDown' : 'animate__fadeOutUp',
    ]"
  >
    <text>{{ message }}</text>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const messageContainer = ref<HTMLElement>();
const isInit = ref(true);
const isOpen = ref(false);
const type = defineModel('type', { type: String, default: 'success' });
const message = defineModel('message', { type: String, default: '默认文本' });
const countdown = 5000;
let timer;
function open() {
  isInit.value = false;
  isOpen.value = true;
  if (!messageContainer.value?.classList.contains('animate__fadeInDown')) {
    messageContainer.value?.classList.add('animate__fadeInDown');
  }
  timer = setTimeout(() => {
    isOpen.value = false;
    timer = null;
  }, countdown);
}

defineExpose({ open });
</script>

<style lang="scss" scoped>
.init-state {
  display: none;
}
.success {
  background-color: #e1f3d8;
  color: $uni-color-success;
}
.error {
  background-color: #fde2e2;
  color: $uni-color-error;
}
.top-message {
  text-align: center;
  line-height: 2rem;
  position: fixed;
  top: 0;
  width: 100vw;
  height: 2rem;
  z-index: 99;
  font-size: 14px;
}
</style>
