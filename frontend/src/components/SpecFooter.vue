<template>
  <view class="footer-menu">
    <view
      v-for="menu in props.menus"
      :key="menu.value"
      class="menu-item"
      :class="[activeMenu === menu.value ? 'menu-item--active' : '']"
      @click="() => switchMenu(menu)"
    >
      <uni-badge
        class="uni-badge-left-margin"
        :text="menu.value === 'relation' && store.unreadTagRelationCount"
        :is-dot="menu.feature"
        absolute="rightTop"
        size="small"
      >
        <button
          class="button-wrap"
          :open-type="menu.value === 'share' ? 'share' : ''"
        >
          <view
            class="iconfont"
            :class="[menu.icon, activeMenu === menu.value ? 'button--active' : '']"
          ></view>
        </button>
      </uni-badge>
      <view>{{ menu.title }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/wowStore';

const store = useUserStore();
const activeMenu = defineModel('modelValue', {
  type: String,
  default: 'relation',
});
const props = defineProps({
  menus: {
    type: Array<{ title: string; value: string; icon: string; page?: string }>,
    default: () => [],
  },
});
const emits = defineEmits(['change']);

function switchMenu(menuItem) {
  if (menuItem.value !== 'share' && activeMenu.value !== menuItem.value) {
    activeMenu.value = menuItem.value;
  }
  emits('change', menuItem.value);
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
  z-index: 99;

  .button-wrap {
    padding: 0;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 24px;
    background: transparent;
    color: #bbb;

    .iconfont {
      font-size: 40rpx;
    }

    .button--active {
      color: $uni-color-primary !important;
    }
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
