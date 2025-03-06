<template>
  <uni-notice-bar
    v-if="isShowNotice && scrollText"
    show-icon
    show-get-more
    color="#2979FF"
    background-color="#EAF2FF"
    more-text="查看更多"
    :text="scrollText"
    @click="onClickNotice"
  />
  <uni-swiper-dot
    :info="homeViewData?.carousels"
    :dots-styles="dotsStyles"
    :current="currentSwipper"
    field="content"
    mode="round"
  >
    <swiper class="swiper-box" @change="onSwipperChange" autoplay>
      <swiper-item
        class="swiper-item-container"
        v-for="(item, index) in homeViewData?.carousels"
        :key="index"
        @click="() => navigator.toSpecDetail(item.role_class, item.class_spec)"
      >
        <view class="swiper-item">
          <view class="swiper-item-info">
            <view class="spec-info">
              <image
                class="class-icon"
                :src="getClassIconURL(item.role_class, item.class_spec)"
              />
              <view class="class-labels">
                <view :class="[item.role_class]">
                  <text class="label-spec">{{
                    localeLabels[item.role_class][item.class_spec]
                  }}</text>
                  <text class="label-class">{{
                    localeLabels.class[item.role_class]
                  }}</text>
                </view>
                <view class="info-type">大秘境</view>
              </view>
            </view>
            <view class="tags">
              <text class="tag-label">11.1.0 地心之战</text>
            </view>
          </view>
        </view>
        <view
          class="swiper-item-bg"
          :style="{
            backgroundImage: getSwipperBgURL(item.role_class, item.class_spec),
          }"
        >
        </view>
      </swiper-item>
    </swiper>
  </uni-swiper-dot>

  <view class="entries">
    <view
      class="entries-item"
      @click="
        () => homeViewData && navigator.toTierList(homeViewData?.tierLists?.[0])
      "
    >
      <uni-icons type="auth-filled" size="36" color="#bbb"></uni-icons>
      <view>专精排行</view>
    </view>
    <view class="entries-item" @click="navigator.toSpecPopularity()">
      <uni-icons type="fire-filled" size="36" color="#bbb"></uni-icons>
      <view>专精热度</view>
    </view>
    <view class="entries-item" @click="navigator.toSpecsMenu()">
      <uni-icons type="map-filled" size="36" color="#bbb"></uni-icons>
      <view>专精攻略</view>
    </view>
    <view class="entries-item" @click="navigator.toMythicDungeonList()">
      <uni-icons type="pyq" size="36" color="#bbb"></uni-icons>
      <view>大秘境</view>
    </view>
  </view>

  <!-- 精选板块 -->
  <view class="divide-section">
    <view class="prefix">
      <view class="icon"></view>
      <view class="title">精选板块</view>
    </view>
  </view>
  <view class="narrow-card-container">
    <view class="narrow-card" @click="() => navigator.toSpecPopularity()">
      <view class="narrow-card_info highlight-shadow">
        <view class="info">
          <view class="card-name">大秘境全专精热度</view>
          <view class="card-desc">{{
            homeViewData?.tierLists?.[0]?.version_id
          }}</view>
        </view>
      </view>
      <view class="narrow-card_bg"></view>
    </view>
    <view class="narrow-card" @click="() => navigator.toMythicDungeonList()">
      <view class="narrow-card_info">
        <uni-icons
          class="icon"
          color="#d32121"
          type="fire-filled"
          size="24"
        ></uni-icons>
        <view class="info">
          <view class="card-name">大秘境攻略</view>
          <view class="card-desc">MDT路线 | 动图攻略</view>
        </view>
      </view>
      <view class="narrow-card_bg narrow-card_bg--mythic"></view>
    </view>
  </view>

  <!-- 热门 -->
  <view class="divide-section">
    <view class="prefix">
      <view class="icon"></view>
      <view class="title">热门专精</view>
    </view>
    <view class="suffix" @click="navigator.toSpecsMenu">更多职业</view>
  </view>
  <view class="hot-topic">
    <view
      class="simple-card"
      v-for="(item, index) in homeViewData?.hotTopics"
      :key="index"
      @click="() => navigator.toSpecDetail(item.role_class, item.class_spec)"
    >
      <view class="card-info">
        <view class="spec-info">
          <image :src="getClassIconURL(item.role_class, item.class_spec)" />
          <view class="labels">
            <text class="label-spec">{{
              localeLabels[item.role_class][item.class_spec]
            }}</text>
            <text class="label-class">{{
              localeLabels.class[item.role_class]
            }}</text>
          </view>
        </view>
      </view>
      <view
        class="card-bg"
        :style="{
          backgroundImage: getSwipperBgURL(item.role_class, item.class_spec),
        }"
      >
      </view>
    </view>
  </view>

  <ShareIcon />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onShow, onShareAppMessage } from '@dcloudio/uni-app';

import { ILocaleLabels } from '@/interface/ILocaleLabels';
import { queryHomeView, IHomeViewDTO } from '@/api/wow';
import labels from '@/data/zh.json';
import { useNavigator } from '@/hooks/navigator';
import ShareIcon from '@/components/ShareIcon.vue';
import { queryScorllInfo } from '@/api/shared';

const navigator = useNavigator();
onShareAppMessage(() => ({
  title: '银子的搜罗坊',
  path: 'pages/index/index',
}));

const homeViewData = ref<IHomeViewDTO>();
const currentSwipper = ref(0);
const scrollText = ref('');
onLoad(async () => {
  homeViewData.value = await queryHomeView();
});
onShow(async () => {
  isShowNotice.value = true;
  setNoticeBarCountdown();
  scrollText.value = await queryScorllInfo();
});

function onSwipperChange(e: any) {
  currentSwipper.value = e.detail.current;
}
const localeLabels = labels as ILocaleLabels;
const dotsStyles = ref({
  backgroundColor: 'rgba(83, 200, 249,0.3)',
  border: '1px rgba(83, 200, 249,0.3) solid',
  color: '#fff',
  selectedBackgroundColor: 'rgba(83, 200, 249,0.9)',
  selectedBorder: '1px rgba(83, 200, 249,0.9) solid',
});
const getSwipperBgURL = computed(() => {
  return (roleClass: string, classSpec: string) => {
    let formatClass;
    if (roleClass === 'demon-hunter') {
      formatClass = 'dh';
    } else if (roleClass === 'death-knight') {
      formatClass = 'dk';
    } else {
      formatClass = roleClass;
    }
    return `url(https://ginkolearn.cyou/api/wow/assets/class-bgs/${formatClass}-${classSpec}-spec-background.webp)`;
  };
});
const getClassIconURL = computed(() => {
  return (roleClass: string, classSpec: string) =>
    `https://ginkolearn.cyou/api/wow/assets/class-icons/${roleClass}-${classSpec}-class-icon.webp`;
});

const isShowNotice = ref(true);
function setNoticeBarCountdown() {
  let timer: any = setTimeout(() => {
    isShowNotice.value = false;
    timer = null;
  }, 10000);
}

function onClickNotice() {
  navigator.toPatchLog();
}
</script>

<style lang="scss" scoped>
$heightDividedByWidth: 56.2 / 100;
$simple-card-width: 43.5vw;
.swiper-box {
  width: 100vw !important;
  height: calc(100vw * $heightDividedByWidth) !important;
  .swiper-item-container {
    height: 100%;
    position: relative;
    .swiper-item,
    .swiper-item-bg {
      margin: 1rem;
      margin-bottom: 0;
      width: calc(100% - 2.2rem);
      height: calc(100% - 1.2rem);
      border-radius: 1rem;
    }
    .swiper-item {
      border: 0.1rem solid #999;
      position: relative;
      .swiper-item-info {
        position: absolute;
        right: 1rem;
        top: 1rem;
        .spec-info {
          display: flex;
          align-items: center;
          .class-icon {
            height: 2.4rem;
            width: 2.4rem;
            border-radius: 0.2rem;
            border: 0.1rem solid #999;
          }
          .class-labels {
            margin-left: 0.2rem;
            font-weight: bolder;
            font-size: medium;
            height: 2.4rem;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            .label-spec {
              font-size: large;
              margin-right: 0.2rem;
            }
            .info-type {
              font-size: small;
              color: $uni-text-color-grey;
              font-weight: normal;
            }
          }
        }
      }
      .tags {
        margin-top: 10px;
      }
    }
    .swiper-item-bg {
      position: absolute;
      background-size: cover;
      background-repeat: no-repeat;
      mask-image: linear-gradient(
        90deg,
        rgb(255, 255, 255) 50%,
        transparent 90%
      );
      border: 0.1rem solid #99999900;
      top: 0;
      z-index: -1;
    }
  }
}
.entries {
  display: flex;
  justify-content: space-between;
  margin: 0.6rem 1rem 0 1rem;
  .entries-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 28vw;
    view {
      font-size: 14px;
      color: #fff;
      font-weight: bold;
    }
  }
}

::v-deep .uni-section-header {
  padding: 1rem !important;
  padding-top: 2rem;
  color: #fff !important;
}

.hot-topic {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 0 1rem;
  padding-bottom: 1rem;
  .simple-card {
    width: $simple-card-width;
    height: calc($simple-card-width * $heightDividedByWidth);
    margin-bottom: calc(100vw - 2rem - $simple-card-width * 2);
    position: relative;

    border-radius: 1rem;
    border: 0.1rem solid #6d6d6d;
    &:nth-child(3),
    &:nth-child(4) {
      margin-bottom: 0 !important;
    }
    .card-bg,
    .card-info {
      width: 100% !important;
      height: 100% !important;
      border-radius: 1rem;
    }
    .card-info {
      position: relative;
      background: transparent;
      .spec-info {
        position: absolute;
        z-index: 2;
        left: 0.2rem;
        bottom: 0.2rem;
        display: flex;
        align-items: center;
        .labels {
          margin-left: 0.5rem;
          font-size: smaller;
          .label-spec {
            font-size: small;
            display: flex;
            flex-direction: column;
            font-weight: bolder;
          }
          text {
            color: #fff;
          }
        }
        image {
          border-radius: 0.2rem;
          width: 2rem;
          height: 2rem;
        }
      }
    }
    .card-bg {
      top: 0;
      position: absolute;
      background-position: centers;
      background-size: cover;
      background-repeat: no-repeat;
      scale: -1 1;
      mask-image: linear-gradient(0deg, transparent 20%, rgb(0, 0, 0) 90%);
    }
  }
}
.narrow-card-container {
  display: flex;
  justify-content: space-between;
  margin: 0 1rem;
}
.narrow-card {
  width: 43.5vw;
  height: 10rem;
  border-radius: 1rem;
  position: relative;
  .narrow-card_bg,
  .narrow-card_info {
    border-radius: 1rem;
    width: 100%;
    height: calc(100% - 0.2rem) !important;
  }
  .highlight-shadow {
    box-shadow: 0 0 6px 2px $color-legend;
  }
  .narrow-card_info {
    border: 0.1rem solid #6d6d6d;
    background-color: transparent;
    position: relative;
    .icon {
      position: absolute;
      z-index: 2;
      top: 0.6rem;
      right: 0.6rem;
    }
    .info {
      position: absolute;
      z-index: 2;
      left: 0.6rem;
      bottom: 0.6rem;
      .card-name {
        font-size: medium;
        color: #fff;
        font-weight: bold;
        margin-bottom: 0.6rem;
      }
      .card-desc {
        font-size: small;
        color: #fff;
      }
    }
  }
  .narrow-card_bg {
    top: 0.1rem;
    left: 0.1rem;
    z-index: 0;
    position: absolute;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    background-image: url(https://ginkolearn.cyou/api/wow/assets/dungeon/wow-generic-news-image-10.webp);
  }
  .narrow-card_bg--mythic {
    background-image: url(https://ginkolearn.cyou/api/wow/assets/dungeon/bg-undermine.jpg);
  }
}

.divide-section {
  margin: 1rem;
  margin-top: 1.2rem;
  display: flex;
  justify-content: space-between;
  color: #fff;
  font-size: 14px;
  line-height: 14px;
  .prefix {
    display: flex;
    .icon {
      width: 4px;
      height: 12px;
      border-radius: 10px;

      margin-right: 6px;
      background-color: #2979ff;
    }
  }
  .suffix {
    color: #2979ff;
  }
}
</style>
