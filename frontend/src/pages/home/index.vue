<template>
  <uni-swiper-dot
    :info="swipperInfo"
    :current="current"
    :dots-styles="dotsStyles"
    field="content"
    mode="round"
  >
    <swiper class="swiper-box" @change="change">
      <swiper-item
        class="swiper-item-container"
        v-for="(item, index) in swipperInfo"
        :key="index"
      >
        <view class="swiper-item">
          <view class="swiper-item-info">
            <view class="spec-info">
              <image
                class="class-icon"
                :src="getClassIconURL(item.roleClass, item.classSpec)"
              />
              <view class="class-labels">
                <view :class="[item.roleClass]">
                  <text class="label-spec">{{
                    localeLabels[item.roleClass][item.classSpec]
                  }}</text>
                  <text class="label-class">{{
                    localeLabels.class[item.roleClass]
                  }}</text>
                </view>
                <view class="info-type">大秘境</view>
              </view>
            </view>
            <view class="tags">
              <text class="tag-label">11.0.7 地心之战</text>
            </view>
          </view>
        </view>
        <view
          class="swiper-item-bg"
          :style="{
            backgroundImage: getSwipperBgURL(item.roleClass, item.classSpec),
          }"
        >
        </view>
      </swiper-item>
    </swiper>
  </uni-swiper-dot>
  <uni-section title="专精节奏榜" type="line">
    <view class="narrow-card">

    </view>
  </uni-section>
  <uni-section title="热门专精" type="line">
    <view class="hot-topic">
      <view class="simple-card" v-for="(item, index) in hotTopics" :key="index">
        <view class="card-info">
          <view class="spec-info">
            <image :src="getClassIconURL(item.roleClass, item.classSpec)" />
            <view class="labels">
              <text class="label-spec">{{
                localeLabels[item.roleClass][item.classSpec]
              }}</text>
              <text class="label-class">{{
                localeLabels.class[item.roleClass]
              }}</text>
            </view>
          </view>
        </view>
        <view
          class="card-bg"
          :style="{
            backgroundImage: getSwipperBgURL(item.roleClass, item.classSpec),
          }"
        >
        </view>
      </view>
    </view>
  </uni-section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { ILocaleLabels } from '@/interface/ILocaleLabels';
import labels from '@/data/zh.json';

const localeLabels = labels as ILocaleLabels;
const dotsStyles = ref({
  backgroundColor: 'rgba(83, 200, 249,0.3)',
  border: '1px rgba(83, 200, 249,0.3) solid',
  color: '#fff',
  selectedBackgroundColor: 'rgba(83, 200, 249,0.9)',
  selectedBorder: '1px rgba(83, 200, 249,0.9) solid',
});
const swipperInfo = ref([
  {
    roleClass: 'demon-hunter',
    classSpec: 'havoc',
  },
  {
    roleClass: 'death-knight',
    classSpec: 'blood',
  },
  {
    roleClass: 'hunter',
    classSpec: 'beast-mastery',
  },
]);
const current = ref(0);
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
function change(e: any) {
  current.value = e.detail.current;
}

// 热门
const hotTopics = ref([
  {
    roleClass: 'demon-hunter',
    classSpec: 'havoc',
  },
  {
    roleClass: 'death-knight',
    classSpec: 'blood',
  },
  {
    roleClass: 'hunter',
    classSpec: 'beast-mastery',
  },
  {
    roleClass: 'hunter',
    classSpec: 'beast-mastery',
  },
]);
</script>

<style lang="scss" scoped>
$heightDividedByWidth: 56.2/ 100;
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

::v-deep .uni-section-header {
  padding: 1rem !important;
  color: #fff !important;
}

.hot-topic {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 0 1rem;
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
</style>
