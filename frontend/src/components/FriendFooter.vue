<template>
  <view class="footer-menu">
    <view
      v-for="menu in menus"
      :key="menu.value"
      class="menu-item"
      :class="[activeMenu === menu.value ? 'menu-item--active' : '']"
      @click="() => switchMenu(menu)"
    >
      <uni-icons
        :type="menu.icon"
        size="24"
        :color="activeMenu === menu.value ? '#007aff' : '#bbb'"
      ></uni-icons>
      <view>{{ menu.title }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { useNavigator } from '@/hooks/navigator';

const activeMenu = defineModel('menu', { type: String, default: 'index' });
const menus = reactive([
  {
    title: '大厅',
    value: 'index',
    icon: 'map-filled',
    page: '/pages/friend/index',
  },
  {
    title: '申请',
    value: 'invites',
    icon: 'personadd-filled',
    page: '/pages/friend/index',
  },
  {
    title: '我的',
    value: 'setting',
    icon: 'vip-filled',
    page: '/pages/friend/setting',
  },
]);
const navigator = useNavigator();
function switchMenu(menuItem) {
  if (activeMenu.value !== menuItem.value) {
    activeMenu.value = menuItem.value;
    navigator.toPage(menuItem.page);
  }
}
</script>
<style lang="scss" scoped>
$header-bg-color: #1d1d1f;
.footer-menu {
  position: fixed;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 60rpx 40rpx 60rpx;
  width: 100vw;
  background-color: $header-bg-color;
  box-sizing: border-box;
  .menu-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #bbb;
    font-size: 20rpx;
    padding: 0 20rpx;
  }
  .menu-item--active {
    color: $uni-color-primary;
    view {
      font-weight: bolder;
    }
  }
}
</style>
