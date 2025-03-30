<template>
  <view class="container">
    <view class="header">
      <uni-icons
        class="close-icon"
        type="closeempty"
        size="26"
        color="#bbb"
      ></uni-icons>
      <view class="header-title">筛选</view>
    </view>
    <view class="main">
      <!-- 左侧菜单 -->
      <scroll-view class="menu-left" scroll-y>
        <view
          v-for="(item, index) in menuList"
          :key="index"
          class="menu-item"
          :class="{
            active: activeMenu === index,
            'active-pre': index === activeMenu - 1,
          }"
          @click="switchMenu(index)"
        >
          {{ item.text }}
        </view>
      </scroll-view>

      <!-- 右侧内容 -->
      <scroll-view class="content-right" scroll-y>
        <!-- 动态内容 -->
        <view
          v-for="(group, gIndex) in activeContent"
          :key="gIndex"
          class="section"
        >
          <view class="section-title">{{ group.text }}</view>
          <view class="options-container">
            <CustomTag
              v-for="(option, oIndex) in group.options"
              :key="oIndex"
              :title="option.text"
              :class="{ selected: group.selected === oIndex }"
              @click="handleSelect(gIndex, oIndex)"
            />
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="btn reset">清除</view>
      <view class="btn confirm">确定</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import CustomTag from '@/components/CustomTag.vue';
import { ITagOptionItem } from '@/api/wow';

const activeMenu = ref(0);

const menuList = defineModel('data', {
  type: Object as () => ITagOptionItem[],
  default: () => [],
});

const activeContent = computed(() => {
  return menuList.value[activeMenu.value]?.options;
});

const switchMenu = index => {
  activeMenu.value = index;
};

const handleSelect = (gIndex, oIndex) => {};
</script>

<style lang="scss" scoped>
$filter-main-color: #262629;

.container {
  height: 100vh;
  background: $uni-bg-color-grey;

  .header {
    height: 80rpx;
    position: relative;

    .close-icon {
      position: absolute;
      left: 30rpx;
      top: 50%;
      transform: translateY(-50%);
    }

    .header-title {
      color: #bbb;
      font-size: 36rpx;
      font-weight: bold;
      line-height: 80rpx;
      text-align: center;
    }
  }
}

.main {
  display: flex;
  height: calc(100vh - 80rpx - 160rpx);
}

.menu-left {
  width: 200rpx;
  background: $filter-main-color;

  .menu-item {
    padding: 32rpx;
    font-size: 28rpx;
    color: #bbb;
    border-left: 6rpx solid transparent;
    position: relative;
    &.active-pre {
      &::after,
      &::before {
        position: absolute;
        width: 30rpx;
        height: 30rpx;
        content: '';
        right: 0;
        bottom: 0;
      }
      &::after {
        background-color: $uni-bg-color-grey;
        z-index: 11;
      }
      &::before {
        border-bottom-right-radius: 50%;
        background-color: $filter-main-color;
        z-index: 12;
      }
    }
    &.active {
      color: #1890ff;
      font-weight: 500;
      border-left-color: #1890ff;
      background-color: $uni-bg-color-grey;
      &::after,
      &::before {
        position: absolute;
        width: 30rpx;
        height: 30rpx;
        right: 0;
        bottom: -30rpx;
        content: '';
      }
      &::after {
        background-color: $uni-bg-color-grey;
        z-index: 11;
      }
      &::before {
        border-top-right-radius: 50%;
        background-color: $filter-main-color;
        z-index: 12;
      }
    }
  }
}

.content-right {
  flex: 1;
  padding: 24rpx;

  .section {
    border-radius: 16rpx;
    margin-bottom: 24rpx;

    &-title {
      font-size: 30rpx;
      font-weight: 600;
      color: #fff;
      margin-bottom: 24rpx;
    }
  }
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;

  .tag-item {
    padding: 12rpx 32rpx;
    background: #f0f0f0;
    border-radius: 40rpx;
    font-size: 26rpx;
    color: #666;
  }
}

.options-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  .option-item {
    padding: 16rpx 32rpx;
    background: #f8f8f8;
    border-radius: 8rpx;
    font-size: 28rpx;
    color: #666;

    &.selected {
      background: #e3f1ff;
      color: #1890ff;
      font-weight: 500;
    }
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  box-sizing: border-box;
  padding: 24rpx;
  padding-bottom: 50rpx;
  height: 160rpx;
  width: 100vw;
  background: $uni-bg-color-grey;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);

  .btn {
    text-align: center;
    padding: 24rpx;
    border-radius: 24rpx;
    font-size: 32rpx;
    height: 40rpx;

    &.reset {
      flex: 0.6;
      background: #262629;
      color: #fff;
      margin-right: 24rpx;
    }

    &.confirm {
      flex: 1;
      background: #1890ff;
      color: #fff;
    }
  }
}
</style>
