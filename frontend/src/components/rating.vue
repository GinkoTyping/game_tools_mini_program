<template>
  <view class="rating-item" v-for="item in data" :key="item.label">
    <view class="label">
      <text>{{ item.label }}</text>
      <text class="sub-label">({{ item.comment }})</text>
    </view>
    <view class="bars">
      <view
        :class="['bar', getBarColor(item.ratingScore, bar)]"
        v-for="(bar, index) in item.rating"
        :key="index"
      >
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
  data: Array<{
    label: string;
    comment: string;
    ratingScore: number;
    rating: number[];
  }>,
});

const getBarColor = computed(() => {
  return (score: number, cur: number) => {
    if (cur) {
      if (score > 3) {
        return 'green-bar';
      }
      if (score > 1) {
        return 'orange-bar';
      }
      return 'red-bar';
    } else {
      return '';
    }
  };
});
</script>

<style lang="scss" scoped>
.rating-item {
  margin-bottom: 6px;
  padding: 6px;
  padding-bottom: 0;
  .label {
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
  }
  .sub-label {
    color: rgb(149, 152, 155);
    font-size: 14px;
  }
  .bars {
    margin: 4px 0;
    display: flex;
    justify-content: space-between;
    .bar {
      width: 18%;
      height: 12px;
      border-radius: 6px;
      background-color: rgb(43, 44, 44);
    }
    .green-bar {
      background-color: rgb(25, 159, 47);
    }
    .orange-bar {
      background-color: rgb(240, 154, 24);
    }
    .red-bar {
      background-color: #bd2625;
    }
  }
}
</style>
