<template>
  <view class="container">
    <view class="card-wrap">
      <image
        class="animate__animated animate__fadeInDown"
        src="https://ginkolearn.cyou/api/wow/assets/tarot/0.jpg"
        mode="heightFix"
        :class="[tarot.isPositive ? 'image--positive' : 'image--negative']"
      />
      <view class="main-content animate__animated animate__zoomIn">
        <view class="title">
          <text class="sub-title">我抽中了</text>
          {{ tarot.name
          }}<text
            class="sub-title"
            :class="[tarot.isPositive ? 'text--positive' : 'text--negative']"
          >
            ({{ tarot.positiveText }})</text
          >
        </view>
        <view
          class="summary"
          :class="[tarot.isPositive ? 'text--positive' : 'text--negative']"
        >
          {{ tarot.summary }}
        </view>
        <view class="suggestion"> 宜: {{ tarot.suggestion }} </view>
      </view>
      <view class="footer animate__animated animate__fadeInUpBig">
        <view class="buttons">
          <button id="other-btn" @click="() => navigator.toHome()">
            其他功能
          </button>
          <button open-type="share">分享</button>
        </view>
        <view id="more">
          <view class="more-button" @click="switchExpand">
            <view class="more-label">{{ isExpand ? '' : '更多' }}</view>
            <uni-icons
              :type="isExpand ? 'up' : 'down'"
              size="20"
              color="#ab8d60"
            ></uni-icons>
          </view>
          <view
            class="fold-content animate__animated"
            v-show="isExpand"
            :class="[isExpand ? 'animate__fadeInUp' : '']"
          >
            今天有99人占卜，其中24人也抽中了{{ tarot.name }}!
          </view>
        </view>
      </view>
    </view>
  </view>

  <ShareIcon />

  <ad-custom unit-id="adunit-5764afeffba54701"></ad-custom>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useNavigator } from '@/hooks/navigator';
import ShareIcon from '@/components/ShareIcon.vue';
import { onShareAppMessage } from '@dcloudio/uni-app';

onShareAppMessage(() => ({
  title: 'WOW今天玩啥？塔罗牌占卜',
  path: 'pages/question/index',
}));

const navigator = useNavigator();
const tarot = ref({
  name: '愚者',
  isPositive: 1,
  positiveText: '正位',
  summary: '新的冒险、自由探索',
  suggestion:
    '练小号、解锁新种族/职业、首次尝试随机战场、探索未去过的地图（如巨龙群岛隐藏区域）',
});

const isExpand = ref(false);
function switchExpand() {
  isExpand.value = !isExpand.value;
}
</script>

<style lang="scss" scoped>
$bg-corlor: #1f2729;
$bg-light-corlor: #292e2c;
$primary-corlor: #ab8d60;
$secondary-corlor: #f4e0c2;
$positive-color: #9bc5a0;
$reverse-color: #fff;
$content-font: 32rpx;
.header {
  text-align: center;
  .info {
    font-size: 40rpx;
    color: #bbb;
  }
}
.container {
  min-height: calc(100vh - 130px);
  padding: 1rem 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: $bg-corlor;
  .title {
    font-weight: bold;
    color: $primary-corlor;
    font-size: 48rpx;
    margin: 20rpx 0 10rpx 0;
    .sub-title {
      font-size: 40rpx;
      color: $secondary-corlor;
    }
  }
  image {
    height: 46vh;
    border-radius: 2vh;
  }
  .image--positive {
    box-shadow: 0 0 14px 6px rgb(135 253 72 / 32%);
  }
  .image--negative {
    box-shadow: 0 0 14px 6px rgb(135 253 72 / 32%);
    scale: -100% -100%;
  }
  .summary {
    font-size: 36rpx;
    color: $secondary-corlor;
  }
  .suggestion {
    color: $secondary-corlor;
    padding: 10rpx 20rpx;
    font-size: 32rpx;
  }
  .text--positive {
    color: $positive-color !important;
  }
  .text--negative {
    color: $color-s-tier !important;
  }
  .buttons {
    display: flex;
    justify-content: center;
    margin: 16rpx 0 16rpx 0;
    button {
      width: 220rpx;
      margin: 0 16rpx;
      font-size: $content-font;
      font-weight: bold;
      border-radius: 10rpx;
    }
    #other-btn {
      background-color: $bg-light-corlor;
      color: $primary-corlor;
      border: 1px solid $primary-corlor;
    }
    button[open-type] {
      color: $reverse-color;
      background-color: $primary-corlor;
    }
  }
  #more {
    font-size: 26rpx;
    .more-button {
      display: flex;
      justify-content: center;
      .more-label {
        color: $primary-corlor;
      }
    }
    .fold-content {
      color: $secondary-corlor;
    }
  }
}
</style>
