<template>
  <uni-collapse ref="collapse" accordion>
    <template v-for="item in displayData" :key="item.role_class">
      <uni-collapse-item>
        <template v-slot:title>
          <view class="slot-title">
            <view :class="[item.role_class, 'menu-title']">
              <text>{{ localeLabels.class[item.role_class] }}</text>
              <image
                v-for="(fire, index) in item.fires"
                :key="index"
                src="/static/icon/fire.svg"
              ></image>
            </view>
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
            }}
          </text>
        </view>
      </uni-collapse-item>
    </template>
  </uni-collapse>

  <view class="footer"></view>

  <view class="ad-container">
    <ad-custom unit-id="adunit-6de8608075fb2574"></ad-custom>
  </view>

  <ShareIcon />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad, onShow, onShareAppMessage } from '@dcloudio/uni-app';

import '@/static/css/index.scss';
import type { ILocaleLabels } from '@/interface/ILocaleLabels';
import labels from '@/data/zh.json';
import { queryTrend } from '@/api/wow';
import { useNavigator } from '@/hooks/navigator';
import ShareIcon from '@/components/ShareIcon.vue';

onShareAppMessage(() => ({
  title: '全专精攻略',
  path: 'pages/index/index',
}));

const queryParams = ref<{ menu: string; scrollTo: string }>();
onLoad(async (options) => {
  queryParams.value = options as typeof queryParams.value;
});

// 用专精页面返回该页面时，也需要刷新
onShow(async () => {
  const data: any = await queryTrend();
  trendData.value = data.trend;
  displayData.value = getSortData();

  spriteConfig.value = data.sprite;
});

//#region 切换排序
const currentMenu = ref('popularity');
const displayData = ref<any>([]);

function getSortData() {
  const clone = JSON.parse(JSON.stringify(trendData.value));
  let output;
  if (currentMenu.value === 'popularity') {
    output = clone.sort((a, b) => b.access_count - a.access_count);
  } else {
    output = clone.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
  }

  return output;
}

//#endregion

const trendData = ref<any>([]);
const spriteConfig = ref<any>({});
const localeLabels = labels as ILocaleLabels;

const navigator = useNavigator();

function onClickSpec(classKey: string, specKey: string) {
  navigator.toSpecDetail(classKey, specKey, queryParams.value?.menu, queryParams.value?.scrollTo);
}

</script>

<style lang="scss" scoped>
.ad-container {
  position: fixed;
  bottom: 42rpx;
  left: 40rpx;
  z-index: 2;
}

.header {
  margin: 0 32px;
}

.access-count-spec {
  color: rgb(97, 97, 97);
  width: 30px;
}

.slot-title {
  display: flex;
  justify-content: space-between;

  .menu-title {
    display: flex;
    align-items: center;

    image {
      margin-left: 4px;
      width: 20px;
      height: 20px;
    }
  }
}

.update-label {
  color: #bbb;
  font-size: 12px;
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

      .spec-update-at {
        position: absolute;
        right: 30px;
        font-size: 12px;
        color: #bbb;
      }

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
  height: 240rpx;
  width: 1vw;
}
</style>
