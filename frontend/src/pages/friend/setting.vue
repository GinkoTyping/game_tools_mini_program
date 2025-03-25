<template>
  <!-- 职责 -->
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
  <!-- 职业 -->
  <uni-section
    id="classes"
    class="priest"
    title="职业"
    subTitle="请选择您主玩的职业(最多选3个)"
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
      <view
        class="btn-item ellipsis"
        @click="
          () =>
            openClassPopup(
              'classes',
              '请选择您主玩的职业(最多3个)',
              allOptions.classes.options
            )
        "
      >
        <text>{{ isAllowAddClass('classes') ? '添加' : '编辑' }}</text>
        <uni-icons
          :type="isAllowAddClass('classes') ? 'plusempty' : 'compose'"
          color="#fff"
          size="16"
        ></uni-icons>
      </view>
    </view>
  </uni-section>
  <!-- 游戏风格 -->
  <uni-section
    id="classes"
    class="priest"
    title="游戏风格"
    subTitle="请选择您游戏风格(最多选3个)"
    type="line"
    titleFontSize="16px"
  >
    <view class="btns">
      <view
        class="btn-item btn-item--normal"
        v-for="item in form.gameStyle"
        :key="item.value"
      >
        <text class="ellipsis">{{ item.text }}</text>
      </view>
      <view
        class="btn-item ellipsis"
        @click="
          () =>
            openClassPopup(
              'gameStyle',
              '请选择您主玩的职业(最多3个)',
              allOptions.gameStyle.options
            )
        "
      >
        <text>{{ isAllowAddClass('gameStyle') ? '添加' : '编辑' }}</text>
        <uni-icons
          :type="isAllowAddClass('gameStyle') ? 'plusempty' : 'compose'"
          color="#fff"
          size="16"
        ></uni-icons>
      </view>
    </view>
  </uni-section>
  <!-- 公共选择器 -->
  <uni-popup ref="classPopup" type="bottom">
    <view class="classPopup">
      <view class="classPopup-header" @click="closeClassPopup">
        <view class="classPopup-header-title">{{ popoverTitle }}</view>
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
        v-for="item in selectionList"
        :key="item.value"
        @click="() => setSelection(item, 3)"
      >
        <view :class="[item.value]">{{ item.text }}</view>
        <view class="class-check">
          <view>点击任意位置</view>
          <uni-icons
            type="checkbox-filled"
            size="28"
            :color="isOptionSelected(item.value) ? 'rgb(29, 245, 1)' : ''"
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
const form = reactive<{
  jobs: IOptionItem[];
  classes: IOptionItem[];
  gameStyle: IOptionItem[];
}>({
  jobs: [],
  classes: [],
  gameStyle: [],
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

//#region 职业 / 游戏风格 公共选择器
const currentFormKey = ref('');
const popoverTitle = ref('');
const selectionList = ref<IOptionItem[]>();
const classPopup = ref();
function openClassPopup(key: string, title: string, list: IOptionItem[]) {
  currentFormKey.value = key;
  popoverTitle.value = title;
  selectionList.value = list;
  classPopup.value?.open?.();
}
function setSelection(item: IOptionItem, max?: number) {
  const key = currentFormKey.value;
  const existed = form[key].find(
    seletedItem => seletedItem.value === item.value
  );
  if (existed) {
    form[key] = form[key].filter(
      seletedItem => seletedItem.value !== item.value
    );
  } else {
    if (max && form[key].length >= max) {
      uni.showToast({
        title: '最多选3个',
        icon: 'error',
      });
    } else {
      form[key].push(item);
    }
  }
}
const isOptionSelected = computed(() => {
  return (value: string) =>
    form[currentFormKey.value].some(item => item.value === value);
});
const isAllowAddClass = computed(() => {
  return (key: string, max: number = 3) => form[key].length < max;
});

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
  .btn-item--normal {
    color: black;
    background-color: #bbb;
    border: none;
  }
  .btn-item--active {
    color: black;
    position: relative;
    &.tank {
      background: $shaman;
      border: none;
    }
    &.healer {
      background: $hunter;
      border: none;
    }
    &.dps {
      background: $death-knight;
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
    color: #fff;
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
