<template>
  <view class="filter-menus" :style="{ justifyContent: props.align }">
    <view
      class="menu"
      :class="[activeMenu === menu.value ? 'menu--active' : '']"
      v-for="menu in data?.list"
      :key="menu.label"
      @click="() => switchMenu(menu.value)"
    >
      <text>{{ menu.label }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { PropType, watch } from 'vue';

const props = defineProps({
  align: {
    type: String,
    default: 'flex-start',
  },
});

interface Idata {
  title: string;
  list: { label: string; value: string | number }[];
}
const data = defineModel('data', {
  type: Object as PropType<Idata>,
});

//#region 选择按钮
const emits = defineEmits(['change']);
const activeMenu = defineModel('value');
watch(
  data,
  value => {
    if (data.value?.list[0]?.value) {
      activeMenu.value = data.value.list[0].value;
    }
  },
  {
    immediate: true,
  }
);
function switchMenu(value: number | string) {
  console.log(value);

  if (value && activeMenu.value !== value) {
    activeMenu.value = value;
    emits('change', value);
  }
}
//#endregion
</script>

<style lang="scss" scoped>
.filter-menus {
  margin: 20rpx 0;
  display: flex;
  .menu {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 72rpx;
    font-size: 30rpx;
    padding: 16rpx 26rpx;
    border-radius: 36rpx;
    background-color: transparent;
    color: #fff;
    box-sizing: border-box;
    font-weight: bold;
    margin-right: 16rpx;
    border: 3rpx solid #bbb;
    box-sizing: border-box;
  }
  .menu--active {
    border: none;
    color: black;
    background: linear-gradient(to right, #007aff, #469dfb);
  }
}
</style>
