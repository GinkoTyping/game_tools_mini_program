<template>
  <uni-section
    id="jobs"
    class="priest"
    title="职责"
    subTitle="请选择您主玩的职责(可多选)"
    type="line"
    titleFontSize="16px"
  >
    <view class="btns">
      <view
        class="btn-item"
        :class="[
          item.value,
          isJobSelected(item.value) ? 'btn-item--active' : '',
        ]"
        v-for="item in allOptions.jobs.options"
        :key="item.value"
        @click="() => selectJobs(item)"
      >
        <text>{{ item.text }}</text>
      </view>
    </view>
  </uni-section>

  <uni-section
    id="classes"
    class="priest"
    title="职业"
    subTitle="请选择您主玩的职业(可多选3个)"
    type="line"
    titleFontSize="16px"
  >
    <view class="btns">
      <view
        class="btn-item btn-item--spec"
        :class="[`${item.value}-bg`, item.value]"
        v-for="item in form.classes"
        :key="item.value"
      >
        <text class="ellipsis">{{ item.text }}</text>
      </view>
      <view class="btn-item ellipsis" @click="openClassPopup">
        <text>{{ isAllowAddClass ? '添加' : '编辑' }}</text>
        <uni-icons
          :type="isAllowAddClass ? 'plusempty' : 'compose'"
          color="#fff"
          size="16"
        ></uni-icons>
      </view>
    </view>
  </uni-section>
  <uni-popup ref="classPopup" type="bottom">
    <view class="classPopup">
      <view class="classPopup-header" @click="closeClassPopup">
        <view class="classPopup-header-title">请选择您主玩的职业(最多3个)</view>
        <view class="classPopup-header-btn">
          <view>确定</view>
          <uni-icons
            type="checkbox-filled"
            size="28"
            :color="form.classes.length ? 'rgb(29, 245, 1)' : ''"
          ></uni-icons>
        </view>
      </view>
      <view
        class="classItem"
        v-for="item in allOptions.classes.options"
        :key="item.value"
        @click="() => selectClasses(item)"
      >
        <view :class="[item.value]">{{ item.text }}</view>
        <view class="class-check">
          <view>点击任意位置</view>
          <uni-icons
            type="checkbox-filled"
            size="28"
            :color="isClassSelected(item.value) ? 'rgb(29, 245, 1)' : ''"
          ></uni-icons>
        </view>
      </view>
    </view>
  </uni-popup>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store/wowStore';
import { onLoad } from '@dcloudio/uni-app';

import { computed, reactive, ref } from 'vue';

const userStore = useUserStore();
const allOptions = computed(() => userStore.friendOptions);
onLoad(async () => {
  await userStore.getFriendOptions();
  console.log(userStore.friendOptions);
});

interface IOptionItem {
  text: string;
  value: string;
}
const form = reactive<{ jobs: IOptionItem[]; classes: IOptionItem[] }>({
  jobs: [],
  classes: [],
});

//#region 职责
function selectJobs(item: IOptionItem) {
  const existed = form.jobs.find(job => job.value === item.value);
  if (existed) {
    form.jobs = form.jobs.filter(job => job.value !== item.value);
  } else {
    form.jobs.push(item);
  }
}
const isJobSelected = computed(() => {
  return (value: string) => form.jobs.some(item => item.value === value);
});
//#endregion

//#region 职业
const classPopup = ref();
function openClassPopup() {
  classPopup.value?.open?.();
}
function selectClasses(item: IOptionItem) {
  const existed = form.classes.find(
    classItem => classItem.value === item.value
  );
  if (existed) {
    form.classes = form.classes.filter(
      classItem => classItem.value !== item.value
    );
  } else {
    if (form.classes.length >= 3) {
      uni.showToast({
        title: '最多选3个',
        icon: 'error',
      });
    } else {
      form.classes.push(item);
    }
  }
}
const isClassSelected = computed(() => {
  return (value: string) => form.classes.some(item => item.value === value);
});
const isAllowAddClass = computed(() => form.classes.length < 3);

function closeClassPopup() {
  classPopup.value?.close?.();
}
//#endregion
</script>

<style lang="scss" scoped>
.btns {
  display: flex;
  flex-wrap: wrap;
  .btn-item {
    font-size: 30rpx;
    padding: 6rpx 28rpx;
    border-width: 1px;
    border-style: solid;
    margin-right: 14rpx;
    margin-bottom: 14rpx;
    box-sizing: border-box;
    height: 56rpx;
    border-radius: 28rpx;
    display: flex;
    align-items: center;
    position: relative;
    text {
      font-weight: bold;
    }
    &:not(.btn-item--spec) {
      border-color: #fff;
    }
  }
  .btn-item--spec {
    text {
      color: black;
    }
  }
  .btn-item--active {
    color: black;
    position: relative;
    &.tank {
      background: $color-d-tier;
      border: none;
    }
    &.healer {
      background: $color-c-tier;
      border: none;
    }
    &.dps {
      background: $uni-color-error;
      border: none;
    }
  }
}

::v-deep .uni-section {
  .uni-section-content {
    padding: 0 12px;
  }
}

.classPopup {
  background-color: $uni-bg-color-grey-light;
  max-height: 60vh;
  overflow: auto;
  padding-top: 100rpx;
  .classPopup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    padding: 20rpx;
    position: fixed;
    top: 0;
    height: 100rpx;
    width: 100%;
    box-sizing: border-box;
    background-color: $uni-bg-color;
    box-shadow: 0 0 6px 2px rgb(255 255 255 / 21%);
    .classPopup-header-title {
      font-size: 30rpx;
    }
    .classPopup-header-btn {
      display: flex;
      align-items: center;
      font-size: 26rpx;
    }
  }
  .classItem {
    text-align: center;
    font-size: 30rpx;
    padding: 10rpx 20rpx;
    border-top: 1px solid #bbb;
    background-color: $uni-bg-color-grey-lighter;
    display: flex;
    justify-content: space-between;
    align-items: center;
    view {
      height: auto;
    }
    .class-check {
      font-size: 26rpx;
      display: flex;
      align-items: center;
      color: #bbb;
    }
  }
}
</style>
