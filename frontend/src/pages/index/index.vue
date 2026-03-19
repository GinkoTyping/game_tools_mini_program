<template>
  <uni-notice-bar
    v-if="isShowNotice && scrollText"
    single
    show-icon
    scrollable
    show-get-more
    color="#2979FF"
    background-color="#EAF2FF"
    more-text="查看更多"
    :text="scrollText"
    @click="onClickNotice"
  />
  <uni-swiper-dot
    :info="carouselsData"
    :dots-styles="dotsStyles"
    :current="currentSwipper"
    field="content"
    mode="round"
  >
    <swiper class="swiper-box" @change="onSwipperChange" autoplay>
      <template v-for="(item, index) in carouselsData" :key="index">
        <swiper-item v-if="item.custom"></swiper-item>
        <swiper-item
          v-else
          class="swiper-item-container"
          @click="
            () => navigator.toSpecDetail(item.role_class, item.class_spec)
          "
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
                      }}
                    </text>
                    <text class="label-class">{{
                        localeLabels.class[item.role_class]
                      }}
                    </text>
                  </view>
                  <view class="info-type">
                    {{ homeViewData?.carouselsType === 'byView' ? `浏览量: ${(item as any).count}` : `大秘境输出: ${(item as any).avg}`
                    }}
                  </view>
                </view>
              </view>
              <view class="tags">
                <text class="tag-label"
                >{{ homeViewData?.carouselsType === 'byView' ? '攻略热度排行' : '大秘境输出排行' }}
                  <text style="font-weight: bold"
                  >NO.{{ index + 1 }}
                  </text
                  >
                </text
                >
              </view>
            </view>
          </view>
          <view
            class="swiper-item-bg"
            :style="{
              backgroundImage: getSwipperBgURL(
                item.role_class,
                item.class_spec
              ),
            }"
          >
          </view>
        </swiper-item>
      </template>
    </swiper>
  </uni-swiper-dot>

  <view class="entries">
    <view
      class="entries-item"
      v-for="entry in homeViewData?.entries"
      :key="entry.page"
      @click="() => onClickFeature(entry)"
    >
      <view
        class="entries-item_dpswow"
        v-if="entry.dpswow">
        <view class="spacing">
          <text>W</text>
          <text>D</text>
        </view>
      </view>
      <uni-icons
        v-else
        :class="[entry.feature ? 'entries-item--feature' : '']"
        :type="entry.icon"
        size="36"
        :color="entry.color ?? '#bbb'"
      ></uni-icons>
      <view>{{ entry.label }}</view>
    </view>
  </view>

  <!-- 魔兽式“相亲” -->
  <view class="divide-section">
    <view class="prefix">
      <view class="icon"></view>
      <view class="title">战网集结令</view>
    </view>
  </view>
  <view class="narrow-card-container">
    <view
      class="narrow-card narrow-card--row"
      @click="() => navigator.toFrindIndex()"
    >
      <view class="narrow-card_info">
        <view class="icon">
          <view>MDI观光</view>
        </view>
        <view class="icon icon-right-bottom">
          <text v-show="notViewedRelationCount" style="color: rgb(244, 123, 0)"
          >({{ notViewedRelationCount }}条未读)
          </text
          >
          <uni-icons color="#bbb" type="image" size="20"></uni-icons>
          <text>{{ homeViewData?.tagCardCount }}</text>
        </view>
        <view class="info">
          <view class="card-name"> 艾泽拉斯同好会</view>
          <view class="card-desc">标签即名片，相逢即战友</view>
        </view>
      </view>
      <view class="narrow-card_bg narrow-card_bg--friend"></view>
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
    <view class="narrow-card" @click="() => navigator.toQuestionIndex()">
      <view class="narrow-card_info">
        <uni-tag
          class="narrow-card_info__tag"
          type="error"
          text="11.2已更新"
          size="small"
          circle
        ></uni-tag>
        <view class="icon">
          <uni-icons
            color="rgb(244, 123, 0)"
            type="hand-up-filled"
            size="20"
          ></uni-icons>
          <text>{{ homeViewData?.mythicMarkCount }}</text>
        </view>
        <view class="info">
          <view class="card-name">做题家</view>
          <view class="card-desc">大秘境开卷考</view>
        </view>
      </view>
      <view class="narrow-card_bg narrow-card_bg--mythic"></view>
    </view>
    <view class="narrow-card" @click="() => navigator.toDivinationIndex()">
      <view class="narrow-card_info highlight-shadow">
        <view class="icon" v-if="homeViewData?.tarotCount">
          <uni-icons
            color="rgb(244, 123, 0)"
            type="search"
            size="20"
          ></uni-icons>
          <text>{{ homeViewData?.tarotCount }}</text>
        </view>
        <view class="info">
          <view class="card-name">每日塔罗牌</view>
          <view class="card-desc">一抽玄学 包红到底🔮</view>
        </view>
      </view>
      <view class="narrow-card_bg"></view>
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
              }}
            </text>
            <text class="label-class">{{
                localeLabels.class[item.role_class]
              }}
            </text>
          </view>
        </view>
        <view class="spec-access-count">
          <uni-icons type="eye-filled" color="#bbb" size="20"></uni-icons>
          <text>{{ item.count }}</text>
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

  <view class="footer"></view>

  <ShareIcon show-chip-entry />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onShow, onShareAppMessage } from '@dcloudio/uni-app';

import type { ILocaleLabels } from '@/interface/ILocaleLabels';
import { queryHomeView, type IHomeViewDTO } from '@/api/wow';
import labels from '@/data/zh.json';
import { useNavigator } from '@/hooks/navigator';
import ShareIcon from '@/components/ShareIcon.vue';
import { queryScorllInfo } from '@/api/shared';
import { useUserStore } from '@/store/wowStore';

const navigator = useNavigator();
onShareAppMessage(() => ({
  title: '银子的搜罗坊',
  path: 'pages/index/index',
}));

const homeViewData = ref<IHomeViewDTO>();
const currentSwipper = ref(0);
const scrollText = ref('');
const store = useUserStore();
const notViewedRelationCount = computed(() => store.notViewedRelations?.count);
const carouselsData = computed(() => homeViewData.value?.carouselsType === 'byView' ? homeViewData.value?.hotTopics : homeViewData.value?.carousels);

onLoad(async () => {
  store.getNotViewedRelations();

  homeViewData.value = await queryHomeView();
  // TODO: 待后端新增custom轮播图
  homeViewData.value.carousels = homeViewData.value.carousels.filter(
    item => !item.custom,
  );
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

function onClickFeature(entryItem: any) {
  if (entryItem.dpswow) {
    navigator.toWowDps();
  } else {
    navigator.toPage(entryItem.page);
  }
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

    .entries-item_dpswow {
      width: 72rpx;
      height: 72rpx;
      padding: 8rpx;
      box-sizing: border-box;

      .spacing {
        height: 100%;
        width: 100%;
        border-radius: 50%;
        background-color: #e37e00;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #d32121;
        font-weight: bolder;
        font-size: 30rpx;

        text {
          &:first-child {
            margin-right: -10rpx;
          }
        }
      }
    }

    view {
      font-size: 14px;
      color: #fff;
      font-weight: bold;
    }
  }

  .entries-item--feature {
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 2px;
      right: 2px;
      width: 8px;
      height: 8px;
      background-color: $color-s-tier;
      border-radius: 50%;
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

      .spec-access-count {
        position: absolute;
        z-index: 2;
        right: 0.25rem;
        bottom: 0rem;
        color: #bbb;
        font-size: small;
        display: flex;
        align-items: center;
      }

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
      background-position: center;
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

    .narrow-card_info__tag {
      position: absolute;
      z-index: 3;
      left: 0.4rem;
      top: 0.4rem;
    }

    .icon {
      position: absolute;
      z-index: 2;
      right: 0.6rem;
      color: $color-legend;
      display: flex;
      align-items: center;
      font-weight: bold;
      font-size: 14px;
    }

    .icon:not(.icon-right-bottom) {
      top: 0.6rem;
    }

    .icon-right-bottom {
      bottom: 0.4rem;
      color: #bbb;
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
    background-image: url(https://ginkolearn.cyou/api/wow/assets/dungeon/Patchnotes.webp);
  }

  .narrow-card_bg--friend {
    background-image: url(https://ginkolearn.cyou/api/wow/assets/home/friend-home.webp);
    mask-image: linear-gradient(0deg, transparent 0%, rgb(0, 0, 0) 90%);
  }
}

.narrow-card.narrow-card--row {
  height: 8rem;
  width: 100% !important;
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

.footer {
  height: 4rem;
  width: 1vw;
}
</style>
