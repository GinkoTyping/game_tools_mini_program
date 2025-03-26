<template>
  <view class="header">
    <uni-segmented-control
      :current="currentTab"
      :values="tabs"
      style-type="button"
      active-color="#007aff"
      @clickItem="switchTab"
    />
  </view>
  <view class="wow-wrap" v-show="currentTab === 0">
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
          v-for="item in wowOptions.jobs.options"
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
          v-for="item in wowForm.classes"
          :key="item.value"
        >
          <text class="ellipsis">{{ item.text }}</text>
        </view>
        <view
          class="btn-item ellipsis"
          @click="
            () =>
              openSelectionPopup(
                'classes',
                '请选择您主玩的职业(最多3个)',
                wowOptions.classes.options
              )
          "
        >
          <text>{{ isAllowAddSelection('classes') ? '添加' : '编辑' }}</text>
          <uni-icons
            :type="isAllowAddSelection('classes') ? 'plusempty' : 'compose'"
            color="#fff"
            size="16"
          ></uni-icons>
        </view>
      </view>
    </uni-section>
    <!-- 游戏风格 -->
    <uni-section
      id="game-style"
      class="priest"
      title="游戏风格"
      subTitle="请选择您游戏风格(最多选3个)"
      type="line"
      titleFontSize="16px"
    >
      <view class="btns">
        <view
          class="btn-item btn-item--common"
          v-for="item in wowForm.gameStyle"
          :key="item.value"
        >
          <text class="ellipsis">{{ item.text }}</text>
        </view>
        <view
          class="btn-item ellipsis"
          @click="
            () =>
              openSelectionPopup(
                'gameStyle',
                '请选择您主玩的职业(最多3个)',
                wowOptions.gameStyle.options
              )
          "
        >
          <text>{{ isAllowAddSelection('gameStyle') ? '添加' : '编辑' }}</text>
          <uni-icons
            :type="isAllowAddSelection('gameStyle') ? 'plusempty' : 'compose'"
            color="#fff"
            size="16"
          ></uni-icons>
        </view>
      </view>
    </uni-section>
    <!-- 活跃时间段 -->
    <uni-section
      id="active-time"
      class="priest"
      title="活跃时间段"
      subTitle="请点亮您活跃的时间段"
      type="line"
      titleFontSize="16px"
    >
      <view class="active-time-wrap">
        <view
          class="active-time-item"
          v-for="(item, dayIndex) in wowForm.activeTime"
        >
          <view class="active-time-item__title">
            <view>{{ item.title }}</view>
            <uni-icons
              :type="dayIndex ? 'color' : 'calendar'"
              size="20"
              color="#007aff"
            ></uni-icons>
          </view>
          <view class="active-time-item_content">
            <view
              class="active-time-item__times-wrap"
              v-for="range in [0, 12]"
              :key="range"
            >
              <view class="active-time-item__times">
                <view
                  class="active-time-item__times-item"
                  :class="[
                    timeItem.selected
                      ? 'active-time-item__times-item--active'
                      : '',
                  ]"
                  v-for="timeItem in item.values.slice(range, range + 6)"
                  :key="timeItem.value"
                  @click="() => onClickTimeItem(dayIndex, timeItem)"
                >
                  <text
                    class="time-label"
                    :class="[timeLabelClass(timeItem.value)]"
                    v-show="isDisplayTime(timeItem.value, dayIndex)"
                    >{{ `${timeItem.value}:00` }}</text
                  >
                </view>
              </view>
              <view class="active-time-item__times">
                <view
                  class="active-time-item__times-item"
                  :class="[
                    timeItem.selected
                      ? 'active-time-item__times-item--active'
                      : '',
                  ]"
                  v-for="timeItem in item.values.slice(range + 6, range + 12)"
                  :key="timeItem.value"
                  @click="() => onClickTimeItem(dayIndex, timeItem)"
                >
                  <text
                    class="time-label"
                    :class="[timeLabelClass(timeItem.value)]"
                    v-show="isDisplayTime(timeItem.value, dayIndex)"
                    >{{ `${timeItem.value}:00` }}</text
                  >
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </uni-section>
    <!-- 隐私设置 -->
    <uni-section
      id="privacy"
      class="priest"
      title="隐私设置"
      subTitle="大家如何找到你？"
      type="line"
      titleFontSize="16px"
    >
      <template v-slot:right>
        <view class="right-slot">
          <text>信息如何被使用？是否安全</text>
          <uni-icons type="help-filled" size="30" color="#007aff"></uni-icons>
        </view>
      </template>
      <uni-easyinput
        class="contact-input"
        type="password"
        v-model="battlenetId"
        placeholder="战网昵称或者邮箱"
      ></uni-easyinput>
      <view class="switch-list">
        <view class="switch-lits-item">
          <view class="switch-lits-item__label">获取战网信息时需要我同意</view>
          <switch
            :checked="wowForm.privacy.needConfirm"
            color="#007aff"
            style="transform: scale(0.7)"
          />
        </view>
      </view>
    </uni-section>
  </view>
  <view class="common-wrap" v-show="currentTab === 1">
    <uni-section
      id="status"
      class="priest"
      title="状态"
      subTitle="请选择您目前的状态(最多选3个)"
      type="line"
      titleFontSize="16px"
    >
      <view class="btns">
        <view
          class="btn-item btn-item--common"
          v-for="item in commonForm.status"
          :key="item.value"
        >
          <text class="ellipsis">{{ item.text }}</text>
        </view>
        <view
          class="btn-item ellipsis"
          @click="
            () =>
              openSelectionPopup(
                'status',
                '请选择您目前的状态(最多3个)',
                commonOptions.status.options,
                'button'
              )
          "
        >
          <text>{{ isAllowAddSelection('gameStyle') ? '添加' : '编辑' }}</text>
          <uni-icons
            :type="isAllowAddSelection('gameStyle') ? 'plusempty' : 'compose'"
            color="#fff"
            size="16"
          ></uni-icons>
        </view> </view
    ></uni-section>
    <uni-section
      id="game"
      class="priest"
      title="常玩游戏"
      subTitle="请选择您其他常玩的游戏(最多选3个)"
      type="line"
      titleFontSize="16px"
    >
      <view class="btns">
        <view
          class="btn-item btn-item--common"
          v-for="item in commonForm.game"
          :key="item.value"
        >
          <text class="ellipsis">{{ item.text }}</text>
        </view>
        <view
          class="btn-item ellipsis"
          @click="
            () =>
              openSelectionPopup(
                'game',
                '请选择您目前的状态(最多3个)',
                commonOptions.game.options,
                'button'
              )
          "
        >
          <text>{{ isAllowAddSelection('gameStyle') ? '添加' : '编辑' }}</text>
          <uni-icons
            :type="isAllowAddSelection('gameStyle') ? 'plusempty' : 'compose'"
            color="#fff"
            size="16"
          ></uni-icons>
        </view> </view
    ></uni-section>
  </view>
  <view id="buttons">
    <view class="submit-btn" @click="submit">注册</view>
  </view>
  <view class="footer"></view>

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
            :color="wowForm.classes.length ? 'rgb(29, 245, 1)' : ''"
          ></uni-icons>
        </view>
      </view>
      <template v-if="optionDisplayType === 'list'">
        <view
          class="classItem"
          v-for="item in selectionList"
          :key="item.value"
          @click="() => setSelection(item, 'wow', 3)"
        >
          <view :class="[item.value]">{{ item.text }}</view>
          <view class="class-check">
            <view>点击任意位置</view>
            <uni-icons
              type="checkbox-filled"
              size="28"
              :color="
                isOptionSelected(item.value, wowForm) ? 'rgb(29, 245, 1)' : ''
              "
            ></uni-icons>
          </view>
        </view>
      </template>
      <template v-if="optionDisplayType === 'button'">
        <view class="btns">
          <view
            class="btn-item"
            :class="
              isOptionSelected(item.value, commonForm)
                ? 'btn-item--common'
                : 'btn-item--reverse'
            "
            v-for="item in selectionList"
            :key="item.value"
            @click="() => setSelection(item, 'common', 3)"
          >
            <text class="ellipsis">{{ item.text }}</text>
          </view>
        </view>
      </template>
    </view>
  </uni-popup>
</template>

<script lang="ts" setup>
import { queryAddUserTag } from '@/api/wow';
import { useUserStore } from '@/store/wowStore';
import { onLoad } from '@dcloudio/uni-app';

import { computed, reactive, ref } from 'vue';

const userStore = useUserStore();
const wowOptions = computed(() => userStore.userTagOptions.wowOptions);
const commonOptions = computed(() => userStore.userTagOptions.commonOptions);
onLoad(async () => {
  await userStore.getFriendOptions();
});

//#region 分段器
const currentTab = ref(1);
const tabs = ref(['基本信息', '其他(选填)']);
function switchTab(e) {
  if (currentTab.value !== e.currentIndex) {
    currentTab.value = e.currentIndex;
  }
}
//#endregion

//#region 基本信息
interface IOptionItem {
  text: string;
  value: string;
}
function getBasicTimeValues(title) {
  return {
    title: title,
    values: new Array(24).fill({ text: '', value: 0 }).map((item, index) => ({
      text: `${index}:00`,
      value: index,
      selected: false,
    })),
  };
}
const wowForm = reactive<{
  jobs: IOptionItem[];
  classes: IOptionItem[];
  gameStyle: IOptionItem[];
  activeTime: {
    title: string;
    values: { text: string; value: number; selected: boolean }[];
  }[];
  privacy: { needConfirm: boolean };
}>({
  jobs: [],
  classes: [],
  gameStyle: [],
  activeTime: [getBasicTimeValues('工作日'), getBasicTimeValues('休息日')],
  privacy: { needConfirm: true },
});
const battlenetId = ref('');
//#endregion

//#region 职责
function selectJobs(item: IOptionItem) {
  const existed = wowForm.jobs.find(job => job.value === item.value);
  if (existed) {
    wowForm.jobs = wowForm.jobs.filter(job => job.value !== item.value);
  } else {
    wowForm.jobs.push(item);
  }
}
const isJobSelected = computed(() => {
  return (value: string) => wowForm.jobs.some(item => item.value === value);
});
//#endregion

//#region 职业 / 游戏风格 公共选择器
const currentFormKey = ref('');
const popoverTitle = ref('');
const selectionList = ref<IOptionItem[]>();
const classPopup = ref();
const optionDisplayType = ref('list');
function openSelectionPopup(
  key: string,
  title: string,
  list: IOptionItem[],
  display: string = 'list'
) {
  currentFormKey.value = key;
  popoverTitle.value = title;
  selectionList.value = list;
  optionDisplayType.value = display;
  classPopup.value?.open?.();
}
function setSelection(item: IOptionItem, type: 'wow' | 'common', max?: number) {
  const key = currentFormKey.value;
  const formRef = type === 'wow' ? wowForm : commonForm;
  const existed = formRef[key].find(
    seletedItem => seletedItem.value === item.value
  );
  if (existed) {
    formRef[key] = formRef[key].filter(
      seletedItem => seletedItem.value !== item.value
    );
  } else {
    if (max && formRef[key].length >= max) {
      uni.showToast({
        title: '最多选3个',
        icon: 'error',
      });
    } else {
      formRef[key].push(item);
    }
  }
}
const isOptionSelected = computed(() => {
  return (value: string, form) =>
    form[currentFormKey.value].some(item => item.value === value);
});
const isAllowAddSelection = computed(() => {
  return (key: string, max: number = 3) => wowForm[key].length < max;
});

function closeClassPopup() {
  classPopup.value?.close?.();
}
//#endregion

//#region 活跃时间段
const currentClickTime = ref<string>();
let displayTimer;
const isDisplayTime = computed(
  () => (value: number, dayIndex: number) =>
    [0, 6, 12, 18].includes(value) ||
    (currentClickTime.value === `${dayIndex}-${value}` &&
      ![1, 7, 13, 19].includes(value))
);
const timeLabelClass = computed(() => {
  return (value: number) => {
    if ([0, 12].includes(value)) {
      return 'time-label--left-top';
    }
    if ([6, 18].includes(value)) {
      return 'time-label--center-top';
    }
    if ([11, 23].includes(value)) {
      return 'time-label--right-top';
    }
    return 'time-label-normal';
  };
});
function onClickTimeItem(dayIndex, item) {
  item.selected = !item.selected;
  clearTimeout(displayTimer);
  currentClickTime.value = `${dayIndex}-${item.value}`;
  displayTimer = setTimeout(() => {
    currentClickTime.value = '';
  }, 1000);
}
//#endregion

//#region 其他信息
const commonForm = reactive<{ status: IOptionItem[]; game: IOptionItem[] }>({
  status: [],
  game: [],
});
//#endregion

//#region 提交
function validate() {
  const isJobsValid = wowForm.jobs.length;
  const isClassesValid = wowForm.classes.length;
  const isGameStyleValid = wowForm.gameStyle.length;
  const isActiveTimeValid = wowForm.activeTime.reduce((pre, cur) => {
    const selected = cur.values.filter(item => item.selected);
    pre.push(...selected);
    return pre;
  }, [] as any).length;
  console.log({
    isJobsValid,
    isClassesValid,
    isGameStyleValid,
    isActiveTimeValid,
  });
  return isJobsValid && isClassesValid && isGameStyleValid && isActiveTimeValid;
}
async function submit() {
  const isValid = validate();
  if (isValid) {
    const result = await queryAddUserTag({
      battlenetId: battlenetId.value,
      wowTag: wowForm,
    });
    console.log({ result });
  } else {
    uni.showToast({
      title: '未填写完整',
      icon: 'error',
    });
  }
}
//#endregion
</script>

<style lang="scss" scoped>
.header {
  padding: 0 12px;
}
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
    background-color: #fff;
    border: none;
  }
  .btn-item--common {
    color: $uni-color-primary;
    background-color: #c2d6fd;
    border: none;
  }
  .btn-item--reverse {
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
  border-bottom: 1px solid $uni-bg-color-grey-lighter;

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

  .btns {
    padding: 12px;
    text {
      font-weight: normal !important;
    }
  }
}

$time-item-gap: 20rpx;
$time-range-item-gap: 30rpx;
$time-item-width: calc(
  (100vw - 24px - $time-range-item-gap - $time-item-gap * 11) / 12
);
$time-item-height: calc(
  (100vw - 24px - $time-range-item-gap - $time-item-gap * 11) / 12 * 2
);
$time-item-radius: calc(
  (100vw - 24px - $time-range-item-gap - $time-item-gap * 11) / 12 / 2
);

#active-time {
  .active-time-item {
    .active-time-item__title {
      padding: 10rpx 0;
      display: flex;
      align-items: center;

      view {
        font-size: 28rpx;
        font-weight: bold;
      }
    }

    .active-time-item_content {
      padding-top: 30rpx;

      .active-time-item__times-wrap {
        display: flex;
        justify-content: space-between;

        &:first-child {
          margin-bottom: 30rpx;
        }

        .active-time-item__times {
          display: flex;
          justify-content: space-between;
          flex: 1;

          &:first-child {
            margin-right: $time-range-item-gap;
          }

          .active-time-item__times-item {
            background-color: $uni-bg-color-grey-lighter;
            width: $time-item-width;
            height: $time-item-height;
            border-radius: $time-item-radius;
            margin-bottom: 10rpx;
            position: relative;

            &.active-time-item__times-item--active {
              background-color: $uni-color-primary;
            }

            .time-label {
              position: absolute;

              &.time-label--left-top {
                top: 0;
                left: 0;
                transform: translateY(-100%);
              }

              &.time-label--center-top {
                top: 0;
                left: 0;
                transform: translateY(-100%);
              }

              &.time-label--right-top {
                top: 0;
                right: 0;
                transform: translateY(-100%);
              }

              &.time-label-normal {
                top: 0;
                left: 50%;
                transform: translate(-50%, -100%);
              }
            }
          }
        }
      }
    }
  }
}

#privacy {
  .right-slot {
    display: flex;
    align-items: center;
  }

  .switch-list {
    padding: 14rpx 0;
    background-color: $uni-bg-color-grey;

    .switch-lits-item {
      padding: 10rpx 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #fff;
    }
  }
}

#buttons {
  padding: 20rpx 12px;
  display: flex;
  justify-content: flex-end;
  box-sizing: border-box;

  .submit-btn {
    width: 100%;
    padding: 10rpx 48rpx;
    box-sizing: border-box;
    border-radius: 30rpx;
    background-color: $uni-color-primary;
    text-align: center;
    font-size: 32rpx;
    font-weight: bold;
    color: #fff;
  }
}

.footer {
  height: 140rpx;
  width: 100vw;
}
</style>
