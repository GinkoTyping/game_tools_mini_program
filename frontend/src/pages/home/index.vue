<template>
  <uni-swiper-dot
    :info="homeViewData?.carousels"
    :dots-styles="dotsStyles"
    field="content"
    mode="round"
  >
    <swiper class="swiper-box">
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
              <text class="tag-label">11.0.7 地心之战</text>
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

  <!-- 排行 -->
  <view class="divide-section">
    <view class="prefix">
      <view class="icon"></view>
      <view class="title">排行榜</view>
    </view>
  </view>
  <view
    class="narrow-card"
    @click="
      () => homeViewData && navigator.toTierList(homeViewData?.tierLists[0])
    "
  >
    <view class="narrow-card_info">
      <view class="info">
        <view class="card-name">大秘境专精排行</view>
        <view class="card-desc">{{
          homeViewData?.tierLists[0]?.version_id
        }}</view>
      </view>
    </view>
    <view class="narrow-card_bg"></view>
  </view>

  <!-- 热门 -->
  <view class="divide-section">
    <view class="prefix">
      <view class="icon"></view>
      <view class="title">热门</view>
    </view>
    <view class="suffix" @click="navigator.toSpecsMenu">更多</view>
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
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';

import { ILocaleLabels } from '@/interface/ILocaleLabels';
import { queryHomeView, IHomeViewDTO } from '@/api/wow';
import labels from '@/data/zh.json';
import { useNavigator } from '@/hooks/navigator';

onShareAppMessage(() => ({
  title: '银子的搜罗坊',
  path: 'pages/home/index',
}));

const homeViewData = ref<IHomeViewDTO>();
onLoad(async () => {
  homeViewData.value = await queryHomeView();
  console.log(homeViewData.value);
  
});

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

const navigator = useNavigator();
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
.narrow-card {
  width: 100vw;
  height: 10rem;
  margin: 0 1rem;
  border-radius: 1rem;
  position: relative;
  .narrow-card_bg,
  .narrow-card_info {
    border-radius: 1rem;
    width: calc(100vw - 2.2rem) !important;
    height: calc(100% - 0.2rem) !important;
  }
  .narrow-card_info {
    border: 0.1rem solid #6d6d6d;
    background-color: transparent;
    position: relative;
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
        color: #999;
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
    background-image: url(https://ginkolearn.cyou/api/wow/assets/dungeon/dungeons-high.webp);
  }
}

.divide-section {
  margin: 1rem;
  margin-top: 2rem;
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
