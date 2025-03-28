<template>
  <view class="card-wrap">
    <view class="card-content" v-if="props.type === 'normal'">
      <view class="main-spec">
        <image
          class="spec-image"
          src="https://ginkolearn.cyou/api/wow/assets/class-icons/hunter-beast-mastery-class-icon.webp"
          mode="widthFix"
        />

        <view class="main-spec__content">
          <view
            class="main-spec__content-title"
            :class="[basicClassItem.value]"
          >
            <view class="class-spec">野兽掌控</view>
            <view class="role-class">猎人</view>
          </view>
          <view class="main-spec__content-other">
            <view class="game-style label-list">
              <text class="label-list-item" v-for="item in wowTag?.gameStyle">{{
                item.text
              }}</text>
            </view>
          </view>
        </view>
      </view>
      <view class="sub-content label-list">
        <image
          class="label-list-item__job"
          v-for="job in wowTag?.jobs"
          :key="job.value"
          :src="`/static/images/wow/job-icons/role-icon-${job.value}.jpg`"
          mode="heightFix"
        />
        <view
          class="label-list-item__class label-list-item"
          v-for="classItem in wowTag?.classes"
          :key="classItem.value"
          :class="[`${classItem.value}-bg`]"
          >{{ classItem.text }}</view
        >
        <template
          v-for="propKey in ['age', 'status', 'personality', 'game', 'role']"
          :key="propKey"
        >
          <view
            class="label-list-item"
            v-for="item in commonTag?.[propKey]"
            :key="item.value"
            >{{ item.text }}</view
          >
        </template>
      </view>
      <ActiveTimeBar
        v-model="activeTime.workDay"
        direction="row"
        width="100vw - 80rpx"
      />
      <ActiveTimeBar
        v-model="activeTime.weekend"
        direction="row"
        width="100vw - 80rpx"
      />
    </view>
    <view class="card-content-simple" v-if="props.type === 'simple'">
      <image
        class="card-content-simple__left spec-image"
        src="https://ginkolearn.cyou/api/wow/assets/class-icons/hunter-beast-mastery-class-icon.webp"
        mode="widthFix"
      />
      <view class="card-content-simple__right label-list">
        <image
          class="label-list-item__job"
          v-for="job in wowTag?.jobs"
          :key="job.value"
          :src="`/static/images/wow/job-icons/role-icon-${job.value}.jpg`"
          mode="heightFix"
        />
        <view
          class="label-list-item__class label-list-item"
          v-for="classItem in wowTag?.classes"
          :key="classItem.value"
          :class="[`${classItem.value}-bg`]"
          >{{ classItem.text }}</view
        >
        <text class="label-list-item" v-for="item in wowTag?.gameStyle">{{
          item.text
        }}</text>
        <text class="label-list-item" v-for="item in commonTag?.role">{{
          item.text
        }}</text>
      </view>
    </view>
    <view
      class="card-bg"
      :style="{
        backgroundImage:
          'url(https://ginkolearn.cyou/api/wow/assets/class-bgs/hunter-beast-mastery-spec-background.webp)',
      }"
    >
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { IActiveTimeBar, ICommonTag, IWowTag } from '@/interface/IUserTag';
import localeLabels from '@/data/zh.json';
import ActiveTimeBar from '@/components/ActiveTimeBar.vue';

interface ITagCard {
  wow_tag: IWowTag;
  common_tag: ICommonTag;
}

const props = defineProps({
  data: {
    type: Object as () => ITagCard,
    required: true,
    default: () => ({}),
  },
  type: {
    type: String,
    default: 'normal',
    validator: (value: string) => ['normal', 'simple'].includes(value),
  },
});

const wowTag = computed(() => {
  return props.data.wow_tag;
});
const commonTag = computed(() => props.data.common_tag);

//#region 时间
const activeTime = reactive<{
  workDay: IActiveTimeBar[];
  weekend: IActiveTimeBar[];
}>({
  workDay: [],
  weekend: [],
});
watch(
  () => props.data,
  val => {
    activeTime.workDay = val?.wow_tag.activeTime[0].values;
    activeTime.weekend = val?.wow_tag.activeTime[1].values;
    console.log(activeTime);
  },
  {
    deep: true,
    immediate: true,
  }
);
//#endregion
//#region 文本样式
const basicClassItem = computed(() => wowTag.value?.classes?.[0]);
const getBgURL = computed(() => {
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
//#endregion
</script>
<style lang="scss" scoped>
$label-height: 40rpx;
$label-margin-bottom: 12rpx;
.card-wrap {
  padding: 20rpx;
  // min-height: 20vh;
  border-radius: 20rpx;
  position: relative;
  box-sizing: border-box;
  border: 0.1rem solid #6d6d6d;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  // 公共
  .spec-image {
    width: 100rpx;
    height: 100rpx;
    margin-right: 18rpx;
    border-radius: 24rpx;
  }
  .label-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    font-size: 24rpx;
    line-height: $label-height;
    .label-list-item {
      height: $label-height;
      margin-right: 12rpx;
      margin-bottom: $label-margin-bottom;
      padding: 0 16rpx;
      color: black;
      border-radius: 12rpx;
      &:not(.label-list-item__class) {
        background-color: #999;
      }
    }
    .label-list-item__job {
      margin-bottom: $label-margin-bottom;
      width: $label-height;
      height: $label-height;
    }
  }
  // 完整版
  .card-content {
    width: 100%;
    padding-top: 0rpx;
    .main-spec {
      display: flex;
      align-items: center;
      margin-bottom: 10rpx;
      .main-spec__content {
        height: 110rpx;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .main-spec__content-title {
          display: flex;
          align-items: flex-end;
          font-weight: bold;

          .class-spec {
            font-size: 36rpx;
            margin-right: 10rpx;
          }
          .role-class {
            font-size: 28rpx;
          }
        }
        .main-spec__content-other {
          display: flex;
          font-size: 28rpx;
          height: 50rpx;
          line-height: 50rpx;
        }
      }
    }
  }
  // 缩略版
  .card-content-simple {
    display: flex;
    .card-content-simple__left {
    }
    .card-content-simple__right {
      flex: 1;

      max-height: calc($label-height * 2 + $label-margin-bottom);
      overflow: hidden;
    }
  }
  .card-bg {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    box-sizing: border-box;
    border-radius: 20rpx;
    background-position: centers;
    background-size: cover;
    background-repeat: no-repeat;
    scale: -1 1;
    z-index: -1;
    // mask-image: linear-gradient(0deg, transparent 20%, rgb(0, 0, 0) 90%);
  }
}
</style>
