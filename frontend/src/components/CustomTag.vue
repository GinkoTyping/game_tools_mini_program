<template>
  <view
    class="tag-button"
    :class="[
      props.type,
      props.wowClass,
      props.type === 'spec-reverse' ? `${props.wowClass}-bg` : '',
    ]"
    @click="handleClick"
  >
    <text>{{ props.title }}</text>
    <uni-icons
      v-if="props.suffixIcon"
      :type="props.suffixIcon"
      color="#fff"
      size="12"
    ></uni-icons>
    <slot name="suffix"></slot>
  </view>
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue';

const props = defineProps({
  title: String,
  type: String,
  wowClass: String,
  suffixIcon: String
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
  border-width: 1px;
  border-style: solid;
  box-sizing: border-box;
  gap: 10rpx;
  &:not(.spec):not(.spec-reverse):not(.active) {
    color: #bbb;
  }
  &:not(.spec) {
    border-color: #262629;
  }
  &:not(.spec-reverse) {
    background-color: #262629;
  }
  &.spec-reverse {
    color: black;
  }
  &.active {
    background: $uni-bg-color-grey;
    color: $uni-color-primary;
    border: 1px solid $uni-color-primary;
  }
}
</style>
