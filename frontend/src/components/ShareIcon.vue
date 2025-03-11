<template>
  <view class="share-btns">
    <button
      v-show="props.tierListIcons?.length"
      v-for="item in props.tierListIcons"
      :key="item.role"
      @click="item.onClick"
    >
      <image :src="`/static/images/wow/job-icons/role-icon-${item.role}.jpg`" />
    </button>
    <button @click="showAdDialog">
      <image
        src="/static/images/common/Food-Icons.png"
        style="height: 70%; width: 70%"
      />
    </button>
    <button open-type="share">
      <image src="/static/icon/share.svg" />
    </button>
  </view>

  <uni-popup ref="adPopup" type="dialog">
    <uni-popup-dialog
      type="success"
      cancelText="关闭"
      confirmText="同意"
      title="充能计划"
      @confirm="confirmAd"
    >
      <template v-slot>
        <view class="ad-popup-container">
          <view class="main">
            完整观看最多<text>30</text>秒广告视频 <br />
            投喂程序猿<text>🍗鸡腿碎片</text>x1！
          </view>
          <view class="sub">
            [备战间隙、副本开打前或者您空闲时，顺手给攻略引擎加个油呗~]
          </view>
          <view class="progress-container">
            <view class="progress-bars">
              <view>🍗当前碎片(5/10)：</view>
              <view class="bars">
                <text>▰</text>
                <text>▰</text>
                <text>▰</text>
                <text>▰</text>
                <text>▰</text>
                <text>▱</text>
                <text>▱</text>
                <text>▱</text>
                <text>▱</text>
                <text>▱</text>
              </view>
            </view>
            <image class="down-arrow" src="/static/icon/double-arrow-down.svg" />
            <view></view>
          </view>
          <view class="done-count">
            <image
              v-for="item in new Array(18).fill(1)"
              src="/static/images/common/Food-Icons.png"
              mode="widthFix"
            />
          </view>
        </view>
      </template>
    </uni-popup-dialog>
  </uni-popup>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const props = defineProps({
  tierListIcons: {
    type: Array<any>,
  },
});

const adPopup = ref();
function showAdDialog() {
  adPopup.value?.open?.();
}
function confirmAd() {}
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
.main {
  text-align: center;
  font-size: 14px;
  margin-bottom: 4px;
  text {
    font-weight: bold;
    font-size: 16px;
  }
}
.sub {
  text-align: center;
  font-size: 12px;
  margin-bottom: 10px;
}
.progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  .progress-bars {
    font-size: 12px;
    display: flex;
    justify-content: center;
    margin-bottom: 6px;
  }
  .down-arrow {
    width: 14px;
    height: 14px;
  }
}

.done-count {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  image {
    width: calc((100% - 20px) / 10);
  }
}
</style>
