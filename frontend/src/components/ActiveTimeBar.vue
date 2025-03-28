<template>
  <cell class="container" :style="containerStyle">
    <view v-for="range in [0, 12]" class="list-time-wrap" :key="range">
      <view
        v-for="(startIndex, index) in [0, 6]"
        class="list-time"
        :style="listTimeWrapStyle(index)"
      >
        <view
          class="list-time-item"
          :class="[timeItem.selected ? 'list-time-item--active' : '']"
          :style="listTimeItemStyle"
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
  width: {
    type: String,
    default: '100vw - 24px',
  },
});

const containerStyle = computed(() => {
  return {
    flexDirection: props.direction === 'row' ? 'row' : 'column',
  };
});
const basicCssVars = computed(() => {
  let itemGap;
  let itemGroupGap;
  let divideCount;
  let gapByRow;
  if (props.direction === 'row') {
    itemGap = '10rpx';
    itemGroupGap = '10rpx';
    divideCount = 24;
    gapByRow = '30px';
  } else {
    itemGap = '20rpx';
    itemGroupGap = '30rpx';
    divideCount = 12;
    gapByRow = '0px';
  }
  return { itemGap, itemGroupGap, divideCount, gapByRow };
});
const listTimeWrapStyle = computed(() => {
  return (index: number) => ({
    justifyContent: props.direction === 'row' ? 'flex-start' : 'space-between',
    marginRight:
      index === 0 && props.direction !== 'row'
        ? basicCssVars.value.itemGroupGap
        : '',
  });
});
const listTimeItemStyle = computed(() => {
  const { itemGap, itemGroupGap, divideCount, gapByRow } = basicCssVars.value;

  const itemWidth = `(${props.width} - ${itemGroupGap} - ${gapByRow} - ${itemGap} * ${divideCount - 2}) / ${divideCount}`;
  const itemHeight = `${itemWidth} * 2`;
  const itemRadius = `${itemWidth} / 2`;
  return {
    width: `calc(${itemWidth})`,
    height: `calc(${itemHeight})`,
    borderRadius: `calc(${itemRadius})`,
    marginRight: props.direction === 'row' ? itemGap : '',
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

.container {
  display: flex;
  justify-content: space-between;
}

.list-time-wrap {
  display: flex;
  justify-content: space-between;

  &:first-child {
    margin-bottom: 30rpx;
  }

  .list-time {
    display: flex;
    flex: 1;


    .list-time-item {
      background-color: $uni-bg-color-grey-lighter;
      margin-bottom: 10rpx;
      position: relative;

      &.list-time-item--active {
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
