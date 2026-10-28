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
        class="animate__animated animate__rubberBand"
        src="/static/images/common/Food-Icons.png"
        style="height: 70%; width: 70%"
      />
      <view class="badage" v-if="!userStore?.isFreeAd"></view>
    </button>
    <view
      class="ad-tooltip animate__animated animate__fadeInDown"
      v-show="watchAdSuccess"
    >🍗+1
    </view
    >
    <button open-type="share">
      <image src="/static/icon/share.svg" />
    </button>
  </view>

  <view class="shortcuts">
    <button
      v-if="props.showChipEntry"
      class="shortcuts-button"
      @click="() => navigator.toWotlkSpecList()"
    >
      <image src="https://ginkolearn.cyou/api/wow/assets/home/wotlk-icon.png" mode="widthFix" />
    </button>

  </view>

  <uni-popup ref="adPopup" type="dialog">
    <uni-popup-dialog
      type="success"
      cancelText="下次一定"
      confirmText="投喂!"
      title="投喂指南⚡"
      @confirm="showAd"
    >
      <template v-slot>
        <view class="ad-popup-container">
          <view class="not-wacth" v-show="!adInfo?.isFreeAd">
            <view class="main">
              <text style="color: #dd524d">{{ adInfo?.count }}人
              </text
              >
              观看了
              <text style="color: #dd524d">30秒</text>
              广告视频
            </view>
            <view class="main">
              <view>给程序猿上了</view>
              <view>
                <text style="color: rgb(29, 245, 1)">24小时</text>
                的
              </view>
              <view
              >
                <image src="/static/images/wow/food_thumb/ability_mage_timewarp.jpg"
                />
              </view>
            </view>
            <view class="main">
              <view>还投喂了</view>
              <view>
                <image src="/static/images/wow/food_thumb/shard.gif" />
                <text>大餐碎片</text>
              </view>
              <view> x1！</view>
            </view>
            <view class="main" v-if="adInfo?.lastUntil?.length">
              <view class="repeat-watch-info">
                上次投喂的buff消失于: {{ adInfo?.lastUntil }}⏳
              </view>
            </view>
          </view>
          <view class="wacthed" v-show="adInfo?.isFreeAd">
            <view class="main">
              <view>
                <text style="color: #dd524d">感谢您</text>
                和其他伙伴
                <text
                  style="color: #dd524d"
                >{{ adInfo?.count - 1 }}次
                </text
                >
                的投喂🎉
              </view>
            </view>
            <view class="main"> 程序猿更有干劲了！</view>
            <view class="main">
              <view>
                <image
                  src="/static/images/wow/food_thumb/ability_mage_timewarp.jpg"
                />
                剩余：
                <text style="color: rgb(29, 245, 1)">{{
                    adInfo?.freeLeft
                  }}
                </text
                >
                ⏳
              </view>
            </view>
            <view class="main">
              <view class="repeat-watch-info"> 在此期间重复观看</view>
            </view>
            <view class="main">
              <view class="repeat-watch-info">
                Buff时间将自动从最后一次观看起延长。
              </view>
            </view>
          </view>
          <view class="sub">
            [备战间隙、副本开打前或者您空闲时，顺手给攻略引擎加个油呗~]
          </view>
          <view class="progress-container">
            <view class="progress-bars">
              <view
              >大餐合成中(
                <text>{{ shardCount }}
                </text
                >
                /10)：
              </view
              >
              <view class="bars">
                <image
                  v-for="(item, index) in shardList"
                  :key="index"
                  :src="`/static/images/wow/food_thumb/${
                    item ? 'shard.gif' : 'shard_a.gif'
                  }`"
                  mode="widthFix"
                ></image>
              </view>
            </view>
            <image
              class="down-arrow"
              src="/static/icon/double-arrow-down.svg"
            />
            <view></view>
          </view>
          <view class="done-count">
            <text v-if="chickenCount <= 0">还没有完整的大餐🍗</text>
            <image
              v-else
              v-for="url in chickenList"
              :src="url"
              mode="widthFix"
            />
          </view>
          <view class="footer"
          >视频有声音，建议
            <text> 静音</text>
            或
            <text> 调低音量
            </text
            >
            观看
          </view
          >
        </view>
      </template>
    </uni-popup-dialog>
  </uni-popup>
</template>

<script lang="ts" setup>
import { queryAdCount, queryUpdateAdCount } from '@/api/shared';
import { ref, onUnmounted } from 'vue';

import { useUserStore } from '@/store/wowStore';
import { useNavigator } from '@/hooks/navigator';
import { getImageSrc } from '@/api/wow';

const navigator = useNavigator();
const props = defineProps({
  tierListIcons: {
    type: Array<any>,
  },
  showChipEntry: {
    type: Boolean,
    default: false,
  },
});
let rewardedVideoAd: any = null;

// 广告初始化
// 免广告倒计时
const adInfo = ref();
const adPopup = ref();
const shardCount = ref(0);
const chickenCount = ref(0);
const shardList = ref<number[]>();
const chickenList = ref<string[]>();
const watchAdSuccess = ref(false);
let timer;

function loadAd() {
  if (!rewardedVideoAd) {
    rewardedVideoAd = uni.createRewardedVideoAd({
      adUnitId: 'adunit-2fc9cdf66956bc88',
    });
    rewardedVideoAd.load().catch(console.error);

    rewardedVideoAd.onClose((res: any) => {
      if (res.isEnded) {
        swicthWatchSuccessTip(true);
      }
      // res.isEnded
      //   ? giveReward()
      //   : uni.showToast({ title: '没关系，有空再投喂吧~', icon: 'none' });
      res.isEnded
        ? giveReward()
        : giveReward();
    });

    rewardedVideoAd.onError((err: any) => {
      console.error('广告错误:', err);
      uni.showToast({ title: '广告加载失败', icon: 'none' });
    });
  }
}

async function showAdDialog() {
  loadAd();

  swicthWatchSuccessTip(false);
  const data = await queryAdCount();
  adInfo.value = data;

  shardCount.value = data.count % 10;
  shardList.value = new Array(shardCount.value).fill(1);
  while (shardList.value.length < 10) {
    shardList.value.push(0);
  }

  chickenCount.value = Math.floor(data.count / 10);
  chickenList.value = new Array(chickenCount.value).fill(1).map(item => {
    const index = Math.floor(Math.random() * 4) + 1;
    return `/static/images/wow/food_thumb/${index}.jpg`;
  });

  adPopup.value?.open?.();
}

function showAd() {
  rewardedVideoAd?.show().catch(() => {
    rewardedVideoAd
      .load()
      .then(() => rewardedVideoAd.show())
      .catch(() => {
        uni.showToast({ title: '广告加载失败', icon: 'none' });
      });
  });
}

function swicthWatchSuccessTip(isShow: boolean) {
  if (isShow) {
    watchAdSuccess.value = true;
    timer = setTimeout(() => {
      watchAdSuccess.value = false;
    }, 3000);
  } else {
    timer = null;
    watchAdSuccess.value = false;
  }
}

const userStore = useUserStore();

async function giveReward() {
  uni.showToast({ title: '谢谢哥! 过了命了!', icon: 'none', duration: 5000 });
  const data = await queryUpdateAdCount();
  if (data) {
    userStore.isFreeAd = data.isFreeAd;
  }
}

defineExpose({
  showAdDialog,
});

// 资源清理
onUnmounted(() => {
  rewardedVideoAd?.destroy();
});
</script>

<style lang="scss" scoped>
.shortcuts {
  position: fixed;
  bottom: 22px;
  left: 22px;
  z-index: 2;
  display: flex;
  align-items: center;
}

.shortcuts-button {
  height: 110rpx;
  width: 110rpx;
  background-color: #000000;
  border: 4rpx solid $uni-color-primary;

  .iconfont {
    font-size: 80rpx;
    color: $color-legend;
  }

  image {
    width: 90rpx;
    border-radius: 50%;
  }

  .badage {
    right: 4rpx;
    top: 4rpx;
    height: 20rpx;
    width: 20rpx;
    background-color: red;
    box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.21);
  }
}

.share-btns {
  position: fixed;
  bottom: 22px;
  right: 22px;
  z-index: 99;
  display: flex;

  .ad-tooltip {
    position: absolute;
    right: calc(36px + 0.4rem);
    transform: translateX(50%);
    top: -28px;
    color: #fff;
    font-weight: bold;
    white-space: nowrap;
    font-size: 20px;
  }
}

button {
  height: 40px;
  width: 40px;
  overflow: visible;
  border-radius: 50%;
  padding: 0;
  margin-left: 0.4rem;
  background-color: #007aff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 6px 2px rgb(255 255 255 / 21%);
  position: relative;
  box-sizing: border-box;

  .badage {
    position: absolute;
    right: 0;
    top: 0;
    color: #fff;
    background-color: $color-s-tier;
    height: 20rpx;
    width: 20rpx;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;

    text {
      font-size: 10px;
      line-height: 32rpx;
    }
  }

  image {
    width: 50%;
    height: 50%;
  }
}

.main {
  text-align: center;
  font-size: 14px;
  margin-bottom: 4px;
  display: flex;
  justify-content: center;

  image {
    margin: 0 2px;
  }

  .repeat-watch-info {
    font-size: 12px;
    color: #bbb;

    text {
      font-size: 12px !important;
      font-weight: bold;
      color: black;
    }
  }

  text {
    font-weight: bold;
  }

  view {
    display: flex;
    align-items: center;

    text {
      font-weight: bold;
      font-size: 16px;
    }

    image {
      border-radius: 30%;
      width: 20px;
      height: 20px;
    }
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
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 6px;
    width: 100%;

    .bars {
      margin-top: 6px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      image {
        width: calc((100% - 50px) / 10);
        margin: 1px;
        position: relative;
        border-radius: 30%;
      }

      .unfilled::after {
        content: '';
        top: 0;
        left: 0;
        position: absolute;
        background-color: rgba($color: #000000, $alpha: 0.2);
        width: 100%;
        height: 100%;
      }
    }
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
  margin-bottom: 12px;
  font-size: 14px;

  image {
    padding: 1px;
    border-radius: 30%;
    width: calc((100% - 50px) / 10);
    max-width: 30px;
  }
}

.footer {
  text-align: center;
  font-size: 12px;
  color: #bbb;

  text {
    color: black;
    font-weight: bold;
    font-size: 14px;
  }
}
</style>
