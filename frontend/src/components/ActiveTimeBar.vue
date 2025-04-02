<template>
  <cell class="container" :style="containerStyle">
    <view
      v-for="(range, rangeIndex) in [0, 12]"
      class="list-time-wrap"
      :key="range"
      :style="listTimeWrapStyle(rangeIndex)"
    >
      <view
        v-for="(startIndex, index) in [0, 6]"
        class="list-time"
        :style="listTimeStyle(index)"
      >
        <view
          v-for="(timeItem, timeItemIndex) in times.slice(
            range + startIndex,
            range + 6 + startIndex
          )"
          :key="timeItem.value"
          class="list-time-item"
          :class="[timeItem.selected ? 'list-time-item--active' : '']"
          :style="listTimeItemStyle(timeItemIndex, index)"
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
  mode: String,
  showTime: Boolean,
  defaultDisplayTime: {
    type: Array<Number>,
    default: () => [0, 6, 12, 18],
  },
  width: {
    type: String,
    default: '100vw - 24px',
  },
});

//#region 样式
const basicCssVars = computed(() => {
  let itemGap;
  let itemGroupGap;
  let divideCount;
  let gapByRow;
  if (props.mode === 'display') {
    itemGap = '10rpx';
    itemGroupGap = '10rpx';
    divideCount = 24;
    gapByRow = '20rpx';
  } else {
    itemGap = '20rpx';
    itemGroupGap = '30rpx';
    divideCount = 12;
    gapByRow = '0px';
  }
  return { itemGap, itemGroupGap, divideCount, gapByRow };
});
const containerStyle = computed(() => {
  return {
    flexDirection: props.mode === 'display' ? 'row' : 'column',
  };
});
const listTimeWrapStyle = computed(() => {
  return (index: number) => ({
    marginBottom: index === 0 && props.mode !== 'display' ? '30rpx' : '',
    marginRight:
      index === 0 && props.mode === 'display'
        ? basicCssVars.value.gapByRow
        : '',
  });
});
const listTimeStyle = computed(() => {
  return (index: number) => ({
    justifyContent: props.mode === 'display' ? 'flex-start' : 'space-between',
    marginRight:
      index === 0 && props.mode !== 'display'
        ? basicCssVars.value.itemGroupGap
        : '',
  });
});
const listTimeItemStyle = computed(() => {
  return (index: number, startIndex) => {
    const { itemGap, itemGroupGap, divideCount, gapByRow } = basicCssVars.value;

    const itemWidth = `(${props.width} - ${itemGroupGap} - ${gapByRow} - ${itemGap} * ${divideCount - 2}) / ${divideCount}`;
    const itemHeight = `${itemWidth} * 2`;
    const itemRadius = `${itemWidth} / 2`;
    let marginRight;
    if (props.mode === 'display') {
      if (startIndex === 0) {
        marginRight = itemGap;
      } else if (startIndex === 1) {
        marginRight = index === 5 ? '' : itemGap;
      }
    } else {
      marginRight = '';
    }
    return {
      width: `calc(${itemWidth})`,
      height: `calc(${itemHeight})`,
      borderRadius: `calc(${itemRadius})`,
      marginRight: marginRight,
      marginBottom: props.mode === 'display' ? '' : '10rpx',
    };
  };
});
//#endregion

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
  if (props.mode === 'edit') {
    item.selected = !item.selected;
  }
  clearTimeout(displayTimer);
  currentClickTime.value = item.value;
  displayTimer = setTimeout(() => {
    currentClickTime.value = -1;
  }, 1000);
}
const timeLabelClass = computed(() => {
  return (value: number) => {
    if ([0, 12].includes(value)) {
      return props.mode === 'display'
        ? 'time-label--left-top--align-center'
        : 'time-label--left-top';
    }
    if ([6, 18].includes(value)) {
      return props.mode === 'display'
        ? 'time-label--left-top--align-center'
        : 'time-label--center-top';
    }
    if ([11, 23].includes(value)) {
      return 'time-label--right-top';
    }
    return 'time-label-normal';
  };
});
const isDisplayTime = computed(
  () => (value: number) =>
    ((props.showTime || props.mode === 'edit') &&
      props.defaultDisplayTime.includes(value)) ||
    (currentClickTime.value === value)
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
  .list-time {
    display: flex;
    flex: 1;

    .list-time-item {
      background-color: $uni-bg-color-grey-lighter;
      position: relative;

      &.list-time-item--active {
        background-color: $uni-color-primary;
      }

      .time-label {
        color: #fff;
        position: absolute;

        &.time-label--left-top {
          top: 0;
          left: 0;
          transform: translateY(-100%);
        }
        &.time-label--left-top--align-center {
          top: 0;
          left: 0;
          transform: translate(-30%, -100%);
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
