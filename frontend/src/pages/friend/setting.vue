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
    <!-- 服务器 -->
    <uni-section
      id="server"
      class="priest"
      title="服务器"
      subTitle="请选择您主玩的服务器"
      type="line"
      titleFontSize="16px"
    >
      <view class="btns">
        <CustomTag
          v-for="item in wowOptions.server.options"
          :key="item.value"
          :type="
            isOptionSelected(item.value, wowForm, 'server') ? 'active' : ''
          "
          :title="item.text"
          @click="() => setSelection(item, 'wow', 'server', 1)"
        />
      </view>
    </uni-section>
    <!-- 职责 -->
    <uni-section
      id="jobs"
      class="priest"
      title="主玩职责"
      subTitle="请选择您主玩的职责(可多选)"
      type="line"
      titleFontSize="16px"
    >
      <view class="btns">
        <CustomTag
          v-for="item in wowOptions.jobs.options"
          :key="item.value"
          :type="isJobSelected(item.value) ? 'spec-reverse' : 'spec'"
          :wow-class="jobClass(item.value)"
          :title="item.text"
          @click="() => selectJobs(item)"
        />
      </view>
    </uni-section>
    <!-- 专精 -->
    <uni-section
      id="spec"
      class="priest"
      title="主玩专精"
      subTitle="请选择您主玩的专精"
      type="line"
      titleFontSize="16px"
    >
      <view class="btns">
        <CustomTag
          v-for="item in wowForm.spec"
          :key="item.value"
          type="spec-reverse"
          :wow-class="item.roleClass"
          :title="item.text"
        />
        <CustomTag
          :title="isAllowAddSelection('spec', wowForm) ? '添加' : '编辑'"
          :suffix-icon="
            isAllowAddSelection('spec', wowForm) ? 'plusempty' : 'compose'
          "
          @click="
            () =>
              openSelectionPopup(
                'spec',
                '请选择您主玩的专精',
                specOptions,
                1,
                'spec'
              )
          "
        />
      </view>
    </uni-section>
    <!-- 副职业 -->
    <uni-section
      id="classes"
      class="priest"
      title="副职业"
      subTitle="请选择您的副职(最多选3个)"
      type="line"
      titleFontSize="16px"
    >
      <view class="btns">
        <CustomTag
          v-for="item in wowForm.classes"
          :key="item.value"
          type="spec-reverse"
          :wow-class="item.value"
          :title="item.text"
        />
        <CustomTag
          :title="isAllowAddSelection('classes', wowForm) ? '添加' : '编辑'"
          :suffix-icon="
            isAllowAddSelection('classes', wowForm) ? 'plusempty' : 'compose'
          "
          @click="
            () =>
              openSelectionPopup(
                'classes',
                '请选择您的副职(最多3个)',
                wowOptions.classes.options,
                3
              )
          "
        />
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
        <CustomTag
          v-for="item in wowForm.gameStyle"
          :key="item.value"
          type="active"
          :title="item.text"
        />
        <CustomTag
          :title="isAllowAddSelection('gameStyle', wowForm) ? '添加' : '编辑'"
          :suffix-icon="
            isAllowAddSelection('gameStyle', wowForm) ? 'plusempty' : 'compose'
          "
          @click="
            () =>
              openSelectionPopup(
                'gameStyle',
                '请选择您游戏风格(最多3个)',
                wowOptions.gameStyle.options,
                3
              )
          "
        />
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
            <ActiveTimeBar v-model="item.values" showTime />
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
      v-for="section in commonSections"
      :key="section.id"
      :id="section.id"
      class="priest"
      :title="section.title"
      :subTitle="section.subTitle"
      type="line"
      titleFontSize="16px"
    >
      <view class="btns">
        <view
          class="btn-item btn-item--common"
          v-for="item in commonForm[section.id]"
          :key="item.value"
        >
          <text class="ellipsis">{{ item.text }}</text>
        </view>
        <view
          class="btn-item ellipsis"
          @click="
            () =>
              openSelectionPopup(
                section.id,
                section.subTitle,
                commonOptions[section.id].options,
                section.max,
                'button'
              )
          "
        >
          <text>{{
            isAllowAddSelection(section.id, commonForm, section.max)
              ? '添加'
              : '编辑'
          }}</text>
          <uni-icons
            :type="
              isAllowAddSelection(section.id, commonForm, section.max)
                ? 'plusempty'
                : 'compose'
            "
            color="#fff"
            size="16"
          ></uni-icons>
        </view>
      </view>
    </uni-section>
  </view>
  <view id="buttons">
    <view class="submit-btn" @click="submit">{{
      isEdit ? '更新' : '注册'
    }}</view>
  </view>
  <view class="footer"></view>

  <FriendFooter />

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
            color="rgb(29, 245, 1)"
          ></uni-icons>
        </view>
      </view>
      <template v-if="optionDisplayType === 'list'">
        <view
          class="classItem"
          v-for="item in selectionList"
          :key="item.value"
          @click="() => setSelection(item, 'wow')"
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
      <template v-if="optionDisplayType === 'spec'">
        <view class="btns">
          <CustomTag
            v-for="item in selectionList"
            :key="item.value"
            @click="() => setSelection(item, 'wow')"
            :type="
              isOptionSelected(item.value, wowForm) ? 'spec-reverse' : 'spec'
            "
            :wow-class="(item as ISpecOptionItem).roleClass"
            :title="item.text"
          />
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
            @click="() => setSelection(item, 'common')"
          >
            <text class="ellipsis">{{ item.text }}</text>
          </view>
        </view>
      </template>
    </view>
  </uni-popup>

  <!-- 提示弹窗 -->
  <uni-popup ref="infoDialog" type="dialog">
    <uni-popup-dialog
      type="success"
      cancelText="跳过"
      confirmText="好的"
      title="更新成功"
      content="还有年龄段、常玩游戏等趣味性的标签，可以丰富您的铭牌。是否去看看？"
      @confirm="comfirmInfoDialog"
    ></uni-popup-dialog>
  </uni-popup>
</template>

<script lang="ts" setup>
import { querySubmitUserTag, queryUserTagById } from '@/api/wow';
import {
  IOptionItem,
  ICommonTag,
  IWowTag,
  ISpecOptionItem,
} from '@/interface/IUserTag';
import { useUserStore } from '@/store/wowStore';
import { onLoad } from '@dcloudio/uni-app';

import { computed, reactive, ref } from 'vue';
import ActiveTimeBar from '@/components/ActiveTimeBar.vue';
import FriendFooter from '@/components/FriendFooter.vue';
import CustomTag from '@/components/CustomTag.vue';

const userStore = useUserStore();
const wowOptions = computed(() => userStore.userTagOptions.wowOptions);
const commonOptions = computed(() => userStore.userTagOptions.commonOptions);
const specOptions = computed(() => userStore.userTagOptions.specs);

//#region 分段器
const currentTab = ref(0);
const tabs = ref(['基本信息', '其他(选填)']);
function switchTab(e) {
  if (currentTab.value !== e.currentIndex) {
    currentTab.value = e.currentIndex;
  }
}
//#endregion

//#region 基本信息
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
const wowForm = reactive<IWowTag>({
  server: [],
  jobs: [],
  spec: [],
  classes: [],
  gameStyle: [],
  communication: [],
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
const jobClass = computed(() => {
  return (job: string) => {
    switch (job) {
      case 'tank':
        return 'shaman';
      case 'healer':
        return 'monk';
      case 'dps':
        return 'death-knight';
      default:
        return 'death-knight';
    }
  };
});
//#endregion

//#region 公共选择器
const currentFormKey = ref('');
const currentSelectMax = ref<number>();
const popoverTitle = ref('');
const selectionList = ref<IOptionItem[] | ISpecOptionItem[]>();
const classPopup = ref();
const optionDisplayType = ref('list');
function openSelectionPopup(
  key: string,
  title: string,
  list: IOptionItem[],
  max: number,
  display: string = 'list'
) {
  currentFormKey.value = key;
  currentSelectMax.value = max;
  popoverTitle.value = title;
  selectionList.value = list;
  optionDisplayType.value = display;
  classPopup.value?.open?.();
}
function setSelection(
  item: IOptionItem,
  type: 'wow' | 'common',
  formKey?: string,
  formKeyMax?: number
) {
  const key = formKey ?? currentFormKey.value;
  const max = formKeyMax ?? currentSelectMax.value;
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
      if (max === 1) {
        formRef[key] = [item];
      } else {
        uni.showToast({
          title: `最多选${max}个`,
          icon: 'error',
        });
      }
    } else {
      formRef[key].push(item);
    }
  }
}
const isOptionSelected = computed(() => {
  return (value: string, form, formKey?: string) =>
    form[formKey ?? currentFormKey.value]?.some(item => item.value === value);
});
const isAllowAddSelection = computed(() => {
  return (key: string, form, max: number = 3) => form[key].length < max;
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
const commonForm = reactive<ICommonTag>({
  status: [],
  age: [],
  game: [],
  personality: [],
  role: [],
});
const commonSections = ref([
  {
    id: 'status',
    title: '状态',
    subTitle: '请选择您目前的状态(最多选3个)',
    max: 3,
  },
  {
    id: 'age',
    title: '年龄',
    subTitle: '请选择您的年龄段',
    max: 1,
  },
  {
    id: 'game',
    title: '常玩游戏',
    subTitle: '请选择您其他常玩的游戏(最多选3个)',
    max: 3,
  },
  {
    id: 'personality',
    title: '赛博八字',
    subTitle: '请选择您星座或者MBTI',
    max: 2,
  },
  {
    id: 'role',
    title: '性格',
    subTitle: '请选择您的性格(最多选3个)',
    max: 3,
  },
]);
//#endregion

//#region 提交
const isEdit = ref(false);
const infoDialog = ref();
function comfirmInfoDialog() {
  currentTab.value = 1;
  infoDialog.value?.close?.();
}
function validate() {
  const isJobsValid = wowForm.jobs.length;
  const isSpecValid = wowForm.spec.length;
  const isClassesValid = wowForm.classes.length;
  const isGameStyleValid = wowForm.gameStyle.length;
  const isActiveTimeValid = wowForm.activeTime.reduce((pre, cur) => {
    const selected = cur.values.filter(item => item.selected);
    pre.push(...selected);
    return pre;
  }, [] as any).length;
  console.log({
    isJobsValid,
    isSpecValid,
    isClassesValid,
    isGameStyleValid,
    isActiveTimeValid,
  });
  return (
    isJobsValid &&
    isSpecValid &&
    isClassesValid &&
    isGameStyleValid &&
    isActiveTimeValid
  );
}
function checkIsCommonTagEmpty() {
  return Object.values(commonForm).filter(value => value.length)?.length === 0;
}
async function submit() {
  const isValid = validate();
  if (isValid) {
    uni.showLoading({
      title: '提交中...',
      mask: true,
    });
    const { isSuccess, message } = await querySubmitUserTag({
      isEdit: isEdit.value,
      battlenetId: battlenetId.value,
      wowTag: wowForm,
      commonTag: commonForm,
    });
    uni.hideLoading();
    if (isSuccess) {
      isEdit.value = true;
      if (
        checkIsCommonTagEmpty() &&
        !userStore.notification.fillCommonUserTag
      ) {
        userStore.notification.fillCommonUserTag = true;
        infoDialog.value?.open?.();
      } else {
        uni.showToast({
          title: message ?? '请求成功',
          icon: isSuccess ? 'success' : 'error',
        });
      }
    } else {
      uni.showToast({
        title: message ?? '请求失败',
        icon: isSuccess ? 'success' : 'error',
      });
    }
  } else {
    uni.showToast({
      title: '基本信息未填写',
      icon: 'error',
    });
  }
}
//#endregion

onLoad(async () => {
  await userStore.getFriendOptions();
  const data = await queryUserTagById();
  isEdit.value = Boolean(data?.wow_tag || data?.common_tag);

  battlenetId.value = data?.battlenet_id;

  if (data?.wow_tag) {
    const { server, jobs, classes, activeTime, gameStyle, privacy, spec } =
      data.wow_tag;
    wowForm.server = server ?? [];
    wowForm.jobs = jobs;
    wowForm.spec = spec;
    wowForm.classes = classes;
    wowForm.gameStyle = gameStyle;
    wowForm.activeTime = activeTime;
    wowForm.privacy = privacy;
  } else {
    wowForm.server.push(wowOptions.value.server.options[0]);
  }

  if (data?.common_tag) {
    const { status, game, age, personality, role } = data.common_tag;
    commonForm.status = status;
    commonForm.game = game;
    commonForm.age = age;
    commonForm.personality = personality;
    commonForm.role = role;
  }
});
</script>

<style lang="scss" scoped>
.header {
  padding: 0 12px;
}

.btns {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  padding-bottom: 14px;
  .btn-item {
    font-size: 26rpx;
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

    &:not(.btn-item--spec):not(.btn-item--spec-option) {
      border-color: #fff;
    }
  }

  .btn-item--spec {
    text {
      color: black;
    }
  }

  .btn-item--spec-option--active {
    text {
      font-weight: bold;
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
    position: fixed;
    top: 0;
    z-index: 2;
    align-items: center;
    padding: 20rpx;
    height: 100rpx;
    width: 100%;
    box-sizing: border-box;
    background-color: $uni-bg-color;
    box-shadow: 0 0 6px 2px rgb(255 255 255 / 21%);
    color: #fff;

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
