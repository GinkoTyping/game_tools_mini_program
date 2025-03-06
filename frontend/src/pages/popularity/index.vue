<template>
  <view class="charts-box">
    <qiun-data-charts type="column" :chartData="chartData" />
  </view>
</template>

<script lang="ts" setup>
import { querySpecPopularity } from '@/api/wow';
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';

const popularityData = ref();
const chartData = ref({
  categories: ['2016', '2017', '2018', '2019', '2020', '2021'],
  series: [
    {
      name: '目标值',
      data: [35, 36, 31, 33, 13, 34],
    },
    {
      name: '完成量',
      data: [18, 27, 21, 24, 6, 28],
    },
  ],
});
onLoad(async () => {
  popularityData.value = await querySpecPopularity();
});
</script>
<style lang="scss" scoped>
.charts-box {
  width: 100%;
  height: 300px;
}
</style>
