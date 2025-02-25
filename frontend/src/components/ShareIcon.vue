<template>
  <view class="share-btns">
    <button
      v-show="props.tierListIcons?.length"
      v-for="item in props.tierListIcons"
      :key="item.role"
      @click="item.onClick"
    >
      <image
        :src="`/static/images/wow/job-icons/role-icon-${item.role}.jpg`"
      />
    </button>
    <button open-type="share">
      <image src="/static/icon/share.svg" />
    </button>
  </view>
</template>

<script lang="ts" setup>
const props = defineProps({
  tierListIcons: {
    type: Array<any>,
  },
});
</script>

<style lang="scss" scoped>
.share-btns {
  position: fixed;
  bottom: 22px;
  right: 22px;
  z-index: 99;
  display: flex;
  button {
    height: 40px;
    width: 40px;
    border-radius: 50%;
    padding: 0;
    margin-left: 0.4rem;
    background-color: #007aff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 6px 2px rgb(255 255 255 / 21%);
    image {
      width: 50%;
      height: 50%;
    }
  }
}
</style>
