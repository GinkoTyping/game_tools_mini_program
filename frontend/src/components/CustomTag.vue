<template>
  <view
    class="tag-button"
    :class="[
      props.type,
      props.wowClass,
      props.type === 'spec-reverse' ? `${props.wowClass}-bg` : '',
      props.size,
      props.theme,
    ]"
    @click="handleClick"
  >
    <text
      v-if="props.iconfontIcon"
      class="iconfont"
      :class="props.iconfontIcon"
      :style="{ color: props.iconfontIconColor }"
    ></text>
    <uni-icons
      v-if="props.prefixIcon"
      :type="props.prefixIcon"
      :color="props.prefixIconColor"
      size="12"
    ></uni-icons>
    <text :style="{ color: props.iconfontIconColor }">{{ props.title }}</text>
    <uni-icons
      v-if="props.suffixIcon"
      :type="props.suffixIcon"
      :color="props.suffixIconColor"
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
  suffixIcon: String,
  suffixIconColor: {
    type: String,
    default: '#fff',
  },
  prefixIcon: String,
  prefixIconColor: {
    type: String,
    default: '#fff',
  },
  iconfontIcon: String,
  iconfontIconColor: {
    type: String,
  },
  size: {
    type: String,
    default: 'normal',
  },
  theme: {
    type: String,
    default: 'light',
  },
});

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
  border-radius: 12rpx;
  border-width: 1px;
  border-style: solid;
  box-sizing: border-box;
  gap: 4rpx;
  &.spec-reverse {
    color: black;
  }
  &.active {
    background: $uni-bg-color-grey;
    color: $uni-color-primary;
    border: 1px solid $uni-color-primary;
  }

  // SIZE
  &.normal {
    padding: 10rpx 20rpx;
    font-size: 26rpx;
    .iconfont {
      font-size: 26rpx;
    }
  }
  &.small {
    padding: 0 20rpx;
    font-size: 24rpx;
    line-height: 36rpx;
    .iconfont {
      font-size: 24rpx;
    }
  }

  // THEME
  &.dark {
    &:not(.spec):not(.spec-reverse):not(.active) {
      color: black;
      border-color: #999;
    }
    &:not(.spec-reverse) {
      background-color: #999;
    }
  }
  &.light {
    &:not(.spec):not(.spec-reverse):not(.active) {
      color: #bbb;
      border-color: #262629;
    }
    &:not(.spec-reverse) {
      background-color: #262629;
    }
  }
}
</style>
