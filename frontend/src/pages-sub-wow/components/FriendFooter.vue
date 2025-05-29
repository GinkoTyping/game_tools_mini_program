<template>
  <view class="footer-menu">
    <view
      v-for="menu in menus"
      :key="menu.value"
      class="menu-item"
      :class="[activeMenu === menu.value ? 'menu-item--active' : '']"
      @click="() => switchMenu(menu)"
    >
      <uni-badge
        class="uni-badge-left-margin"
        :text="menu.value === 'relation' && store.unreadTagRelationCount"
        absolute="rightTop"
        size="small"
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
      </uni-badge>
      <view>{{ menu.title }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { useNavigator } from '@/hooks/navigator';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/wowStore';

const store = useUserStore();
const activeMenu = defineModel('menu', { type: String, default: 'relation' });
const menus = reactive([
  {
    title: '大厅',
    value: 'index',
    icon: 'map-filled',
    page: '/pages-sub-wow/friend/index',
  },
  {
    title: '卡包',
    value: 'relation',
    icon: 'personadd-filled',
    page: '/pages-sub-wow/friend/relation',
  },
  {
    title: '分享',
    value: 'share',
    icon: 'redo-filled',
  },
  {
    title: '主页',
    value: 'home',
    icon: 'home-filled',
    page: '/pages/index/index',
  },
  {
    title: '我的',
    value: 'setting',
    icon: 'vip-filled',
    page: '/pages-sub-wow/friend/setting',
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
    case 'pages-sub-wow/friend/index':
      activeMenu.value = 'index';
      break;
    case 'pages-sub-wow/friend/setting':
      activeMenu.value = 'setting';
      break;
    case 'pages-sub-wow/friend/relation':
      activeMenu.value = 'relation';
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
