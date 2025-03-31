<template>
  <view
    class="tag-button"
    :class="[props.type, props.wowClass]"
    @click="handleClick"
  >
    <text>{{ props.title }}</text>
    <slot name="suffix"></slot>
  </view>
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue';

const props = defineProps({
  title: String,
  type: String,
  wowClass: String,
});

enum ButtonType {
  Normal = 'normal',
  Spec = 'spec',
  Active = 'active',
}
// 声明事件
const emit = defineEmits(['click']);

const handleClick = () => {
  emit('click'); // 触发自定义的 click 事件
};
</script>

<style lang="scss" scoped>
.tag-button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10rpx 20rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  background-color: #262629;
  border-width: 1px;
  border-style: solid;
  box-sizing: border-box;
  &:not(.spec) {
    border-color: #262629;
    color: #bbb;
  }
  &.active {
    background: $uni-bg-color-grey;
    color: $uni-color-primary;
    border: 1px solid $uni-color-primary;
  }
}
</style>
