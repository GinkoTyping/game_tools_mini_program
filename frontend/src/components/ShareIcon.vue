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
    </button>
    <button open-type="share">
      <image src="/static/icon/share.svg" />
    </button>
  </view>

  <uni-popup ref="adPopup" type="dialog">
    <uni-popup-dialog
      type="success"
      cancelText="下次一定"
      confirmText="投喂"
      title="投喂⚡指南"
      @confirm="showAd"
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
              <view
                >🍗合成大餐(<text>{{ shardCount }}</text
                >/10)：</view
              >
              <view class="bars">
                <text v-for="(item, index) in shardList" :key="index">{{
                  item ? '▰' : '▱'
                }}</text>
              </view>
            </view>
            <image
              class="down-arrow"
              src="/static/icon/double-arrow-down.svg"
            />
            <view></view>
          </view>
          <view class="done-count">
            <text v-if="chickenCount <= 0">还没有完整的鸡腿🍗</text>
            <image
              v-else
              v-for="url in chickenList"
              :src="url"
              mode="widthFix"
            />
          </view>
          <view class="footer"
            >视频有声音，建议<text> 静音 </text>或<text> 调低音量 </text
            >观看</view
          >
        </view>
      </template>
    </uni-popup-dialog>
  </uni-popup>
</template>

<script lang="ts" setup>
import { queryAdCount, queryUpdateAdCount } from '@/api/shared';
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  tierListIcons: {
    type: Array<any>,
  },
});
let rewardedVideoAd: any = null;

// 广告初始化
onMounted(() => {
  rewardedVideoAd = uni.createRewardedVideoAd({
    adUnitId: 'adunit-2fc9cdf66956bc88',
  });

  rewardedVideoAd.load().catch(console.error);

  rewardedVideoAd.onClose((res: any) => {
    res.isEnded
      ? giveReward()
      : uni.showToast({ title: '没关系，有空再投喂吧~', icon: 'none' });
  });

  rewardedVideoAd.onError((err: any) => {
    console.error('广告错误:', err);
    uni.showToast({ title: '广告加载失败', icon: 'none' });
  });
});

const adPopup = ref();
const shardCount = ref(0);
const chickenCount = ref(0);
const shardList = ref<number[]>();
const chickenList = ref<string[]>();
async function showAdDialog() {
  const data = await queryAdCount();
  shardCount.value = data.count % 10;
  shardList.value = new Array(shardCount.value).fill(1);
  while (shardList.value.length < 10) {
    shardList.value.push(0);
  }

  chickenCount.value = Math.floor(data.count / 10);
  chickenList.value = new Array(chickenCount.value).fill(1).map(item => {
    const index = Math.floor(Math.random() * 4) + 1;
    return `/static/images/wow/food/${index}.jpg`;
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

async function giveReward() {
  uni.showToast({ title: '感谢支持！' });
  await queryUpdateAdCount();
}

// 资源清理
onUnmounted(() => {
  rewardedVideoAd?.destroy();
});
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
    text {
      font-weight: bold;
      font-size: 14px;
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
