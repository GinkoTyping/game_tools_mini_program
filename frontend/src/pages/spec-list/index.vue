<template>
  <uni-collapse ref="collapse" accordion>
    <template v-for="item in trendData" :key="item.role_class">
      <ad-custom v-if="item.isAd" unit-id="adunit-84c43763a4fcb5e9"></ad-custom>

      <uni-collapse-item v-else>
        <template v-slot:title>
          <view :class="[item.role_class, 'menu-title']">
            <text>{{ localeLabels.class[item.role_class] }}</text>
            <image
              v-for="(fire, index) in item.fires"
              :key="index"
              src="/static/icon/fire.svg"
            ></image>
          </view>
        </template>
        <view
          class="spec"
          v-for="specItem in item.specs"
          :key="specItem.class_spec"
          @click="() => onClickSpec(item.role_class, specItem.class_spec)"
        >
          <view
            :style="{
              width: '20px',
              height: '20px',
              backgroundImage:
                'url(https://ginkolearn.cyou/api/wow/assets/sprites/spec-sprite.png)',
              backgroundPosition: `${
                -spriteConfig[item.role_class][specItem.class_spec] * 20
              }px ${-spriteConfig[item.role_class].sort * 20}px`,
            }"
          ></view>
          <text>{{ localeLabels[item.role_class][specItem.class_spec] }}</text>
          <uni-icons
            v-show="specItem.access_count"
            color="rgb(97, 97, 97)"
            type="eye-filled"
            size="24"
          ></uni-icons>
          <text v-show="specItem.access_count" class="access-count-spec">{{
            specItem.access_count
          }}</text>
        </view>
      </uni-collapse-item>
    </template>
  </uni-collapse>

  <view class="footer"></view>

  <ShareIcon />
  <!-- <view :class="popoverClass">
    <image
      class="popup-icon"
      src="/static/images/common/a-sahua1.png"
      style="transform: scaleX(-1)"
    ></image>
    <text
      >银子的搜罗坊，本日已被访问
      <text style="font-weight: bolder">{{ accessCount }}</text> 次</text
    >
    <image class="popup-icon" src="/static/images/common/a-sahua1.png"></image>
  </view> -->
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad, onShow, onShareAppMessage } from '@dcloudio/uni-app';

import '@/static/css/index.scss';
import { ILocaleLabels } from '@/interface/ILocaleLabels';
import labels from '@/data/zh.json';
import { queryTrend } from '@/api/wow';
import { useNavigator } from '@/hooks/navigator';
import ShareIcon from '@/components/ShareIcon.vue';

onShareAppMessage(() => ({
  title: '全专精攻略',
  path: 'pages/index/index',
}));

onLoad(async () => {});

// 用专精页面返回该页面时，也需要刷新
onShow(async () => {
  const data: any = await queryTrend();
  trendData.value = data.trend;
  trendData.value.splice(10, 0, { isAd: true, role_class: 'ad' });

  spriteConfig.value = data.sprite;
});

// TODO: 选择最多的3个; 规避审核时展示图标
const trendData = ref<any>([]);
const spriteConfig = ref<any>({});
const accessCount = ref<any>();
const popoverClass = ref(['popup-container', 'animate__animated']);
function setAccessPopoverCountdown() {
  // 数据异常时，避免展示错误界面
  if (accessCount.value === -1) {
    popoverClass.value.push('disabled');
    return;
  }

  if (!popoverClass.value.includes('animate__fadeInUp')) {
    popoverClass.value.push('animate__fadeInUp');
  }
  let timer: any = setTimeout(() => {
    if (popoverClass.value.includes('animate__fadeInUp')) {
      popoverClass.value.pop();
      popoverClass.value.push('animate__fadeOut');
    }
    timer = null;
  }, 5000);
}

const localeLabels = labels as ILocaleLabels;

const navigator = useNavigator();
function onClickSpec(classKey: string, specKey: string) {
  navigator.toSpecDetail(classKey, specKey);
}
</script>

<style lang="scss" scoped>
.access-count-spec {
  color: rgb(97, 97, 97);
  width: 30px;
}
.menu-title {
  display: flex;
  align-items: center;
  image {
    margin-left: 4px;
    width: 20px;
    height: 20px;
  }
}
::v-deep .uni-collapse {
  background-color: $uni-bg-color !important;
}
::v-deep uni-collapse-item {
  width: 100vw;
  .uni-collapse-item__title.uni-collapse-item-border {
    line-height: 40px;
    border-bottom: 4px solid $uni-bg-color-grey;
    padding-left: 32px;
    box-sizing: border-box;
    font-size: 16px;
  }
  .uni-collapse-item__wrap {
    background-color: $uni-bg-color-grey !important;
    .uni-collapse-item__wrap-content {
      border: none !important;
    }
    .spec {
      padding-left: 32px;
      box-sizing: border-box;
      font-size: 16px;
      color: $uni-text-color-inverse;
      line-height: 40px;
      border-bottom: 4px solid $uni-bg-color;
      position: relative;
      display: flex;
      align-items: center;
      uni-icons {
        height: 40px;
        margin-left: 4px;
      }
      view {
        width: 20px;
        height: 20px;
        position: absolute;
        left: 8px;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }
}
.popup-icon {
  height: 20px;
  width: 20px;
}

.popup-container {
  width: 100vw;
  position: fixed;
  display: flex;
  justify-content: center;
  bottom: 0 !important;
  background-color: #a1ffb3;
  align-items: center;
  height: 40px;
  text {
    padding: 0 4px;
    color: #3aa239;
  }
}
.popup-container.disabled {
  display: none;
}

.footer {
  height: 5rem;
  width: 1vw;
}
</style>
