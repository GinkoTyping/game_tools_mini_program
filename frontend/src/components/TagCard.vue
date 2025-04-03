<template>
  <view class="card-wrap" :class="[specInfo.roleClass]">
    <view class="card-content" v-if="type === 'normal'">
      <view class="self-mark" v-show="isUserSelf">
        <uni-icons
          class="shaman"
          type="person-filled"
          size="30"
          color="#007aff"
        ></uni-icons>
      </view>
      <!-- 顶部 -->
      <view class="main-spec">
        <image
          class="spec-image"
          :src="getSpecIconURL(specInfo.roleClass, specInfo.classSpec)"
          mode="widthFix"
          @load="onImageLoad"
        />

        <view class="main-spec__content">
          <view class="main-spec__content-title" :class="[specInfo.roleClass]">
            <view class="class-spec">{{
              getNickName(specInfo.roleClass, specInfo.classSpec).main
            }}</view>
            <view class="role-class">{{
              getNickName(specInfo.roleClass, specInfo.classSpec).sub
            }}</view>
            <text class="role-class">{{ serverName }}</text>
          </view>
          <view class="main-spec__content-other">
            <view class="game-style label-list">
              <CustomTag
                v-for="item in [
                  ...(wowTag?.communication ?? []),
                  ...(wowTag?.gameStyle ?? []),
                ]"
                :key="item.value"
                :title="item.text"
                size="small"
                theme="dark"
              />
            </view>
          </view>
        </view>
      </view>
      <!-- 各种tag -->
      <view class="sub-content label-list">
        <image
          class="label-list-item__job"
          v-for="job in wowTag?.jobs"
          :key="job.value"
          :src="`/static/images/wow/job-icons/role-icon-${job.value}.jpg`"
          mode="heightFix"
        />

        <CustomTag
          v-for="classItem in wowTag?.classes"
          :key="classItem.value"
          :title="classItem.text"
          type="spec-reverse"
          :wow-class="classItem.value"
          size="small"
          theme="dark"
        />
        <template
          v-for="propKey in ['age', 'status', 'personality', 'game', 'role']"
          :key="propKey"
        >
          <CustomTag
            v-for="item in commonTag?.[propKey]"
            :key="item.value"
            :title="item.text"
            :wow-class="getTagSetting(propKey, item.value).wowClass"
            :theme="getTagSetting(propKey, item.value).theme"
            :type="getTagSetting(propKey, item.value).type"
            :iconfont-icon="getTagSetting(propKey, item.value).iconfontIcon"
            :iconfont-icon-color="
              getTagSetting(propKey, item.value).iconfontIconColor
            "
            size="small"
          />
        </template>
        <CustomTag
          :title="getUpdatedTime"
          size="small"
          theme="light"
          type="active"
        />
      </view>
      <!-- 时间 -->
      <view
        v-for="item in ['workDay', 'weekend']"
        :key="item"
        class="time-range"
        :class="[item === 'workDay' ? 'time-range__work-day' : '']"
      >
        <view class="time-range__label">{{
          item === 'workDay' ? '工作日' : '休息日'
        }}</view>
        <view class="time-range__bars">
          <ActiveTimeBar
            v-model="activeTime[item]"
            mode="display"
            :show-time="item === 'workDay'"
            :default-display-time="[0, 6, 12, 18]"
            width="100vw - 80rpx - 80rpx"
          />
        </view>
      </view>
      <!-- 按钮 -->
      <view class="buttons">
        <view class="button-item" @click="requestBattlenet">
          <uni-icons
            :type="
              wowTag.privacy.needConfirm ? 'personadd-filled' : 'auth-filled'
            "
            size="30"
            :color="wowTag.privacy.needConfirm ? '#777777' : '#007aff'"
          ></uni-icons>
          <text :class="wowTag.privacy.needConfirm ? '' : 'available'">{{
            dynamicButtonText
          }}</text>
        </view>
        <view class="button-item" @click="switchType('simple')">
          <text>收起</text>
          <uni-icons type="minus-filled" size="28" color="#999"></uni-icons>
        </view>
      </view>
    </view>
    <view class="card-content-simple" v-if="type === 'simple'">
      <image
        class="card-content-simple__left spec-image"
        :src="getSpecIconURL(specInfo.roleClass, specInfo.classSpec)"
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

        <CustomTag
          v-for="classItem in wowTag?.classes"
          :key="classItem.value"
          :title="classItem.text"
          type="spec-reverse"
          :wow-class="classItem.value"
          size="small"
          theme="dark"
        />

        <CustomTag
          v-for="item in [
            ...(wowTag?.communication ?? []),
            ...(wowTag?.gameStyle ?? []),
            ...(commonTag?.role ?? []),
          ]"
          :key="item.value"
          :title="item.text"
          size="small"
          theme="dark"
        />
      </view>
      <view class="buttons" @click="switchType('normal')">
        <text>展开</text>
        <view class="collapse-button">
          <uni-icons type="more-filled" size="16" color="black"></uni-icons>
        </view>
      </view>
    </view>
    <view
      class="card-bg card-bg__mask"
      :style="{
        backgroundImage: getBgURL(specInfo.roleClass, specInfo.classSpec),
      }"
    >
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed, nextTick, reactive, ref, watch } from 'vue';

import { IActiveTimeBar } from '@/interface/IUserTag';
import localeLabels from '@/data/zh.json';
import {
  ITagCardItem,
  queryAddUserTagRelation,
  queryUserTagById,
} from '@/api/wow';
import ActiveTimeBar from '@/components/ActiveTimeBar.vue';
import CustomTag from '@/components/CustomTag.vue';
import { mapIconfont } from '@/utils/iconfont-map';

const type = defineModel('type', {
  type: String,
  default: 'normal',
  validator: (value: string) => ['normal', 'simple'].includes(value),
});

const props = defineProps({
  data: {
    type: Object as () => ITagCardItem,
    required: true,
    default: () => ({}),
  },
  preview: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['cell-update']);

const onImageLoad = () => {
  // TODO 不使用 setTimeout 会造成 z-paging 获取不到node
  setTimeout(() => {
    emit('cell-update');
  }, 500);
};

const wowTag = computed(() => {
  return props.data.wow_tag;
});
const commonTag = computed(() => props.data.common_tag);
const specInfo = computed(() => props.data.wow_tag.spec?.[0]);

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
  },
  {
    deep: true,
    immediate: true,
  }
);
//#endregion

//#region 文本样式
const isUserSelf = computed(() => {
  return uni.getStorageSync('userId') === props.data.user_id;
});
const getNickName = computed(() => {
  return (roleClass: string, classSpec: string) =>
    wowTag.value?.privacy?.displayWxProfile && props.data?.nickName
      ? {
          main: props.data?.nickName,
          sub: `${localeLabels[roleClass][classSpec]} ${localeLabels.class[roleClass]}`,
        }
      : {
          main: localeLabels[roleClass][classSpec],
          sub: localeLabels.class[roleClass],
        };
});
const serverName = computed(() => {
  const serverItem = wowTag.value?.server?.[0];
  return serverItem && serverItem.value !== 'china'
    ? `[${serverItem.text}]`
    : '';
});
const getUpdatedTime = computed(() => {
  const inputTime = props.data?.updated_at;
  const targetDate = new Date(inputTime);
  const now = new Date();

  const diffMs = now.getTime() - targetDate.getTime(); // 时间差（毫秒）
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  // 如果时间差为负数（未来时间），直接返回格式化日期
  if (diffMs < 0) {
    return `${targetDate.getFullYear()}年${
      targetDate.getMonth() + 1
    }月${targetDate.getDate()}日`;
  }

  // 1小时内显示x分钟前
  if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  }

  // 判断是否是今天
  const isToday =
    targetDate.getFullYear() === now.getFullYear() &&
    targetDate.getMonth() === now.getMonth() &&
    targetDate.getDate() === now.getDate();

  if (isToday) {
    return `${diffHours}小时前`;
  }

  // 判断是否是昨天
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    targetDate.getFullYear() === yesterday.getFullYear() &&
    targetDate.getMonth() === yesterday.getMonth() &&
    targetDate.getDate() === yesterday.getDate();

  if (isYesterday) {
    return '昨天';
  }

  // 更早时间返回年月日
  return `${targetDate.getFullYear()}年${
    targetDate.getMonth() + 1
  }月${targetDate.getDate()}日`;
});
const battlenetId = ref();
const dynamicButtonText = computed(() => {
  if (battlenetId.value) {
    return `${battlenetId.value}(点击复制)`;
  }
  return wowTag.value.privacy.needConfirm ? '申请战网' : '获取战网';
});
const getSpecIconURL = computed(() => {
  return (roleClass: string, classSpec: string) => {
    if (wowTag.value?.privacy?.displayWxProfile && props.data?.avatarUrl) {
      return props.data?.avatarUrl;
    }
    return `https://ginkolearn.cyou/api/wow/assets/class-icons/${roleClass}-${classSpec}-class-icon.webp`;
  };
});
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

const getTagSetting = computed(() => {
  return (key: string, value: string) => {
    const { icon, color } = mapIconfont(key, value);

    const setting = {
      iconfontIcon: icon,
      iconfontIconColor: color,
      type: '',
      wowClass: '',
      theme: 'dark',
      color: '',
    };
    if (key === 'status' && value === '可网恋') {
      setting.wowClass = 'paladin';
      setting.type = 'spec';
      setting.theme = 'light';
    }
    if (key === 'personality' && /^[\u4E00-\u9FA5]+$/.test(value)) {
      setting.theme = 'light';
      setting.color = color;
    }
    return setting;
  };
});
//#endregion

//#region 按钮
async function requestBattlenet() {
  if (!wowTag.value?.privacy || props.preview) {
    return;
  }

  if (wowTag.value?.privacy?.needConfirm) {
    uni.showToast({
      title: '用户目前还没有公开战网信息噢',
      icon: 'none',
      duration: 3000,
    });
  } else {
    const data = await queryUserTagById({ id: props.data.id });
    if (data?.battlenet_id) {
      // TODO: loading状态？ 防止连续触发
      await queryAddUserTagRelation({
        targetUserId: props.data.user_id,
        tagId: props.data.id,
        status: 'accepted',
        isAutoApproved: 1,
      });
      battlenetId.value = data.battlenet_id;
      uni.setClipboardData({
        data: data.battlenet_id,
        success: function () {
          uni.showToast({
            title: '已复制战网至粘贴板',
            icon: 'none',
            duration: 3000,
          });
        },
      });
    }
  }
}

function switchType(value: string) {
  type.value = value;
  nextTick(() => {
    emit('cell-update');
  });
}
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
  border-width: 2rpx;
  border-style: solid;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  box-shadow: 0px 2px 5px 2px rgba(255, 255, 255, 0.2);

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
    gap: 12rpx;
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
      width: $label-height;
      height: $label-height;
    }
  }

  // 完整版
  .card-content {
    width: 100%;
    padding-top: 0rpx;
    position: relative;
    z-index: 2;

    .self-mark {
      position: absolute;
      right: 0;
      top: 0;
    }

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
            margin-right: 10rpx;
          }
        }

        .main-spec__content-other {
          display: flex;
          font-size: 28rpx;
          height: 50rpx;
          line-height: 50rpx;
          overflow: hidden;
        }
      }
    }

    .sub-content {
      margin-bottom: 20rpx;
    }

    .time-range {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 10rpx;
      color: #fff;
      font-size: 20rpx;

      .time-range__label {
        width: 80rpx;
        white-space: nowrap;
      }

      &.time-range__work-day {
        padding-top: 26rpx;
      }
    }

    .buttons {
      padding-top: 16rpx;
      display: flex;
      justify-content: space-between;

      .button-item {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0 20rpx;
        font-size: 22rpx;
        color: $uni-text-color-grey;

        & > text {
          margin: 0 10rpx;
        }

        .available {
          color: $uni-color-primary !important;
        }
      }
    }
  }

  // 缩略版
  .card-content-simple {
    display: flex;
    position: relative;

    .card-content-simple__right {
      flex: 1;
      max-height: calc($label-height * 2 + $label-margin-bottom);
      overflow: hidden;
    }

    .buttons {
      position: absolute;
      right: 25rpx;
      bottom: -42rpx;
      height: 42rpx;
      display: flex;
      justify-content: flex-end;
      align-items: center;

      border-radius: 20rpx;
      background-color: $uni-bg-color-grey-lighter;
      color: $uni-text-color-grey;
      border: 1px solid $uni-text-color-grey;
      box-sizing: border-box;
      box-shadow: 0px 2px 6px 0px rgba(255, 255, 255, 0.2);

      & > text {
        font-size: 22rpx;
        padding-left: 20rpx;
        padding-right: 14rpx;
      }

      .collapse-button {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: $uni-text-color-grey;
        width: 42rpx;
        height: 42rpx;
        border-radius: 50%;
      }
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
    z-index: 0;

    &.card-bg__mask {
      mask-image: linear-gradient(0deg, transparent 10%, rgb(0, 0, 0) 80%);
    }
  }
}
</style>
