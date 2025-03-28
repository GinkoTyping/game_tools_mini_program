<template>
  <cell class="active-time-bar-wrap" :style="containerStyle">
    <view
      class="active-time-item__times-wrap"
      v-for="range in [0, 12]"
      :key="range"
    >
      <view class="active-time-item__times" v-for="startIndex in [0, 6]">
        <view
          class="active-time-item__times-item"
          :class="[
            timeItem.selected ? 'active-time-item__times-item--active' : '',
          ]"
          :style="timeBarStyle"
          v-for="timeItem in times.slice(
            range + startIndex,
            range + 6 + startIndex
          )"
          :key="timeItem.value"
          @click="() => onClickTimeItem(timeItem)"
        >
          <text
            class="time-label"
            :class="[timeLabelClass(timeItem.value)]"
            v-show="isDisplayTime(timeItem.value)"
            >{{ `${timeItem.value}:00` }}</text
          >
        </view>
      </view>
    </view>
  </cell>
</template>

<script lang="ts" setup>
import { IActiveTimeBar } from '@/interface/IUserTag';
import { computed, ref } from 'vue';

const props = defineProps({
  direction: String,
});
const containerStyle = computed(() => {
  return {
    flexDirection: props.direction === 'row' ? 'row' : 'column',
  };
});
const timeBarStyle = computed(() => {
  const itemGap = '20rpx';
  const itemGrounpGap = '30rpx';
  const itemWidth = `(100vw - 24px - ${itemGrounpGap} - ${itemGap} * 10) / 12`;
  const itemHeight = `${itemWidth} * 2`;
  const itemRadius = `${itemWidth} / 2`;
  return {
    width: `calc(${itemWidth})`,
    height: `calc(${itemHeight})`,
    borderRadius: `calc(${itemRadius})`,
  };
});

const times = defineModel({
  type: Array<IActiveTimeBar>,
  required: false,
  default: () =>
    new Array(24).fill({ text: '', value: 0 }).map((item, index) => ({
      text: `${index}:00`,
      value: index,
      selected: false,
    })),
});

let displayTimer;
const currentClickTime = ref<number>();
function onClickTimeItem(item) {
  item.selected = !item.selected;
  clearTimeout(displayTimer);
  currentClickTime.value = item.value;
  displayTimer = setTimeout(() => {
    currentClickTime.value = -1;
  }, 1000);
}
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
const isDisplayTime = computed(
  () => (value: number) =>
    [0, 6, 12, 18].includes(value) ||
    (currentClickTime.value === value && ![1, 7, 13, 19].includes(value))
);
</script>
<style lang="scss" scoped>
$time-item-gap: 20rpx;
$time-range-item-gap: 30rpx;

.active-time-bar-wrap {
  display: flex;
}

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
</style>
