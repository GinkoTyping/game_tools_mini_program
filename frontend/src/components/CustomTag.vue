<template>
  <view class="tag-button">
    <text>{{ props.title }}</text>
    <slot name="suffix"></slot>
  </view>
</template>

<script lang="ts" setup>
const props = defineProps({
  title: String,
});
</script>

<style lang="scss" scoped>
$label-height: 40rpx;
.tag-button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10rpx 20rpx;
  height: $label-height;
  border-radius: 12rpx;
  color: #bbb;
  font-size: 26rpx;
  background-color: #262629;
}
</style>
