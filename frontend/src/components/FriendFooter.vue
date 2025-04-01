<template>
  <view class="footer-menu">
    <view
      v-for="menu in menus"
      :key="menu.value"
      class="menu-item"
      :class="[activeMenu === menu.value ? 'menu-item--active' : '']"
      @click="() => switchMenu(menu)"
    >
      <button
        class="button-wrap"
        :open-type="menu.value === 'share' ? 'share' : ''"
      >
        <uni-icons
          :type="menu.icon"
          size="24"
          :color="activeMenu === menu.value ? '#007aff' : '#bbb'"
        ></uni-icons>
      </button>
      <view>{{ menu.title }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { useNavigator } from '@/hooks/navigator';
import { onShareAppMessage, onShow } from '@dcloudio/uni-app';

const activeMenu = defineModel('menu', { type: String, default: 'index' });
const menus = reactive([
  {
    title: '大厅',
    value: 'index',
    icon: 'map-filled',
    page: '/pages/friend/index',
  },
  // {
  //   title: '申请',
  //   value: 'invites',
  //   icon: 'personadd-filled',
  //   page: '/pages/friend/index',
  // },
  {
    title: '分享',
    value: 'share',
    icon: 'redo-filled',
    page: '/pages/friend/index',
  },
  {
    title: '返回主页',
    value: 'home',
    icon: 'home-filled',
    page: '/pages/index/index',
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
  if (menuItem.value !== 'share' && activeMenu.value !== menuItem.value) {
    activeMenu.value = menuItem.value;
    if (activeMenu.value === 'setting') {
      navigator.toPage(menuItem.page);
    } else if (activeMenu.value === 'home') {
      navigator.toHome();
    } else {
      navigator.redirectToPage(menuItem.page);
    }
  }
}
onShow(() => {
  const currentPage = getCurrentPages().slice(-1)?.[0].route;
  switch (currentPage) {
    case 'pages/friend/index':
      activeMenu.value = 'index';
      break;
    case 'pages/friend/setting':
      activeMenu.value = 'setting';
      break;
    default:
      activeMenu.value = 'index';
      console.warn('异常的页面路径');
      break;
  }
});
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
  .button-wrap {
    padding: 0;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 24px;
    background: transparent;
  }
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
