<template>
  <view class="container">
    <view class="image-bg">
      <image
        src="https://ginkolearn.cyou/api/wow/assets/dungeon/wow-generic-news-image-10.webp"
        mode="widthFix"
      />
      <view class="shadow-mask"></view>
    </view>
    <view class="cards-wrap">
      <view class="cards">
        <image
          class="center animate__animated animate__fadeInDown"
          src="https://ginkolearn.cyou/api/wow/assets/tarot/0.jpg"
          mode="widthFix"
        />
        <view
          class="center-shadow animate__animated animate__fadeInDown"
        ></view>
        <image
          class="left animate__animated animate__fadeIn animate__delay-1s"
          src="https://ginkolearn.cyou/api/wow/assets/tarot/1.jpg"
          mode="widthFix"
        />
        <image
          class="right animate__animated animate__fadeIn animate__delay-1s"
          src="https://ginkolearn.cyou/api/wow/assets/tarot/2.jpg"
          mode="widthFix"
        />
      </view>
      <view class="button" @click="drawTarot">
        <image
          class="animate__animated animate__fadeIn animate__delay-1s"
          src="https://ginkolearn.cyou/api/wow/assets/tarot/button.jpg"
        />
        <view class="animate__animated animate__fadeInUp animate__delay-2s">
          {{ userStore.drawTarotInfo.hasDraw ? '查看抽卡结果' : '点击抽卡' }}
        </view>
      </view>
      <view class="footer animate__animated animate__fadeIn animate__delay-2s"
        >{{ userStore.drawTarotInfo.totalCount ?? 0 }}人已抽</view
      >
    </view>
  </view>
  <ad-custom unit-id="adunit-19cdfb0cd4073687"></ad-custom>
  <view class="ad-avoider"></view>

  <ShareIcon />
</template>

<script lang="ts" setup>
import { onShareAppMessage, onShow } from '@dcloudio/uni-app';

import ShareIcon from '@/components/ShareIcon.vue';
import { useUserStore } from '@/store/wowStore';
import { useNavigator } from '@/hooks/navigator';

onShareAppMessage(() => ({
  title: '卡牌玄学改天命，艾泽拉斯掌乾坤',
  path: 'pages/question/index',
}));

onShow(async () => {
  userStore.checkDrawTarot();
});

const userStore = useUserStore();
const navigator = useNavigator();
async function drawTarot() {
  if (!userStore.drawTarotInfo.hasDraw) {
    await userStore.drawTarot();
  }

  navigator.toDivinationResult(userStore.drawTarotInfo.tarot.id);
}
</script>

<style lang="scss" scoped>
$bg-corlor: #1f2729;
$primary-corlor: #ab8d60;
$secondary-corlor: #f4e0c2;

.container {
  min-height: calc(100vh - 130px);
  box-sizing: border-box;
  background-color: $bg-corlor;
  position: relative;
  .image-bg {
    position: relative;
    mask-image: linear-gradient(180deg, rgb(255, 255, 255) 0%, transparent 90%);
    image {
      width: 100vw;
    }
  }
  .cards-wrap {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 60vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    .cards {
      display: flex;
      justify-content: center;
      position: relative;
      margin-top: 20rpx;
      image {
        width: 30vw;
        border-radius: 16rpx;
        box-shadow: 0 0 30px 6px rgb(255 189 168 / 40%);
      }
      .center {
        z-index: 4;
        position: relative;
      }
      .center-shadow {
        width: 30vw !important;
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 70%;
        z-index: 3;
        border-radius: 16rpx;
        box-shadow: 0 0 30px 6px rgba(0, 0, 0, 0.8);
      }
      .left,
      .right {
        width: 27vw;
        z-index: 1;
        bottom: 0rpx;
      }
      .left {
        position: absolute;
        left: 50%;
        transform: translateX(calc(-110% + 0rpx)) rotate(-20deg) !important;
        transform-origin: 56% 100%; /* 旋转基准点设为底部中心 */
      }
      .right {
        right: 50%;
        position: absolute;
        transform: translateX(calc(110% + 0rpx)) rotate(20deg);
        transform-origin: 44% 100%; /* 旋转基准点设为底部中心 */
      }
    }
    .button {
      display: flex;
      flex-direction: column;
      align-items: center;
      image {
        border-radius: 30rpx;
        width: 120rpx;
        height: 120rpx;
        box-shadow: 0 0 6px 2px rgba(255, 189, 168, 0.4);
      }
      view {
        margin-top: 20rpx;
        font-size: 32rpx;
        font-weight: bolder;
        color: $primary-corlor;
      }
    }
    .footer {
      margin-bottom: 10rpx;
      font-size: 24rpx;
      color: $secondary-corlor;
    }
  }
}
.ad-avoider {
  height: 140rpx;
}
</style>
