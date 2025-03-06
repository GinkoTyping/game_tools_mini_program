<template>
  <view style="height: 1200px">
    <LEchart class="echart" ref="chart" @finished="init"></LEchart>
  </view>
</template>

<script setup>
import { querySpecPopularity } from '@/api/wow/index';
import LEchart from '@/components/l-echart/l-echart.vue';
import { onMounted, reactive, ref } from 'vue';

// TODO: 可以使用官网的定制压缩版本
const echarts = require('../../static/echarts.min.js');

let chart = ref(); // 获取dom
const state = reactive({
  option: {},
});
state.option = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '4%',
    containLabel: true,
  },
  xAxis: {
    type: 'value',
    max: 'dataMax',
    splitLine: {
      lineStyle: {
        color: '#bbb',
      },
    },
  },
  yAxis: {
    type: 'category',
    data: [],
    minInterval: 10,
    axisLabel: {
      formatter(value) {
        return value.split('|').shift();
      },
      color(value) {
        return value.split('|').pop();
      },
    },
  },
  series: [
    {
      name: 'percent',
      type: 'bar',
      barWidth: '50%',
      barCategoryGap: '50%',
      data: [],
    },
  ],
};

const popularityData = ref();
onMounted(async () => {
  popularityData.value = await querySpecPopularity();
  popularityData.value.forEach(item => {
    state.option.yAxis.data.unshift(`${item.name_zh}|${item.color}`);
    state.option.series[0].data.unshift(item.percent);
  });

  chart.value.init(echarts, chart => {
    chart.setOption(state.option);
  });
});

// 渲染完成
const init = () => {
  console.log('渲染完成');
};
</script>

<style scopedlang="scss" scoped>
.echart {
  width: 100%;
  height: 600px !important;
}

.title {
  text-align: center;
}
</style>
