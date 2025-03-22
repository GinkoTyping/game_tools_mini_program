<template>
  <view class="container">
    <view class="card-wrap" v-if="tarot.id >= 0">
      <image
        class="animate__animated animate__fadeInDown"
        :src="`https://ginkolearn.cyou/api/wow/assets/tarot/${tarot.id}.jpg`"
        mode="heightFix"
        :class="[tarot.isPositive ? 'image--positive' : 'image--negative']"
      />
      <view class="main-content animate__animated animate__zoomIn">
        <view class="title">
          <text class="sub-title">您抽中了</text>
          {{ tarot.name
          }}<text
            class="sub-title"
            :class="[tarot.isPositive ? 'text--positive' : 'text--negative']"
          >
            ({{ tarot.isPositive ? '正位' : '逆位' }})</text
          >
        </view>
        <view
          class="summary"
          :class="[tarot.isPositive ? 'text--positive' : 'text--negative']"
        >
          {{ tarot.summary }}
        </view>
        <view class="suggestion"> {{ tarot.suggestion }} </view>
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
            <view class="more-label">{{ isExpand ? '收起' : '更多' }}</view>
            <uni-icons
              :type="isExpand ? 'up' : 'down'"
              size="20"
              color="#ab8d60"
            ></uni-icons>
          </view>
          <view
            class="fold-content animate__animated"
            v-if="isExpand"
            :class="[isExpand ? 'animate__fadeInUp' : '']"
          >
            <view
              >今天有<text>{{ userStore.drawTarotInfo.totalCount }}人</text
              >占卜，其中<text>{{ userStore.drawTarotInfo.count }}人</text
              >也抽中了{{ tarot.name }}!</view
            >
            <view @click="clickShowAdDialog"
              >觉得不错的话，点击<text>赏程序猿一个鸡腿🍗</text>吧</view
            >
          </view>
        </view>
      </view>
    </view>
  </view>

  <ShareIcon ref="shareIconRef" />

  <ad-custom unit-id="adunit-5764afeffba54701"></ad-custom>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref } from 'vue';
import { useNavigator } from '@/hooks/navigator';
import ShareIcon from '@/components/ShareIcon.vue';
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/wowStore';

onShareAppMessage(() => ({
  title: '卡牌玄学改天命，艾泽拉斯掌乾坤',
  path: 'pages/question/index',
}));

onLoad(() => {
  nextTick(() => {
    if (!userStore.drawTarotInfo.tarot?.name) {
      uni.showToast({
        title: '请返回抽卡页面',
        icon: 'error',
      });
    }
  });
});

const userStore = useUserStore();
const navigator = useNavigator();
const tarot = computed(() => {
  const isPositive = userStore.drawTarotInfo.tarot.isPositive;
  return {
    id: userStore.drawTarotInfo.tarot.id,
    name: userStore.drawTarotInfo.tarot.name,
    isPositive,
    summary: isPositive
      ? userStore.drawTarotInfo.tarot.positive_summary
      : userStore.drawTarotInfo.tarot.negative_summary,
    suggestion: isPositive
      ? userStore.drawTarotInfo.tarot.positive_suggestion
      : userStore.drawTarotInfo.tarot.negative_suggestion,
  };
});

const isExpand = ref(false);
function switchExpand() {
  isExpand.value = !isExpand.value;
}

const shareIconRef = ref();
function clickShowAdDialog() {
  shareIconRef.value?.showAdDialog?.();
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
    box-shadow: 0 0 14px 6px rgb(253 72 72 / 32%);
    scale: -100% -100%;
  }
  .summary {
    font-weight: bold;
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
      text {
        font-size: 28rpx;
        font-weight: bold;
        color: $primary-corlor;
      }
    }
  }
}
</style>
