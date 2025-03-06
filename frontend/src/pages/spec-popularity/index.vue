<template>
  <uni-card>
    <view class="filter-container">
      <text> 职业： </text>
      <button
        class="filter-container__button"
        :class="[
          currentJob?.value === item.value
            ? 'filter-container__button--active'
            : '',
        ]"
        v-for="item in jobFilters"
        :key="item.value"
        @click="() => switchJob(item)"
      >
        {{ item.label }}
      </button>
    </view>

    <view :style="chartStyle">
      <LEchart ref="chart" @finished="init"></LEchart>
    </view>
  </uni-card>
</template>

<script setup>
import { querySpecPopularity } from '@/api/wow/index';
import LEchart from '@/components/l-echart/l-echart.vue';
import { computed, onMounted, reactive, ref } from 'vue';

const echarts = require('../../static/echarts.min.js');

let chart = ref(); // 获取dom
const state = reactive({
  option: {},
});
state.option = {
  tooltip: {
    trigger: 'axis',
    formatter(value) {
      if (value[0]?.axisValue) {
        const name_zh = value[0].axisValue.split('|').shift();
        const quantity = popularityData[currentJob.value.value].find(
          item => item.name_zh === name_zh
        )?.quantity;
        return `${name_zh}: ${(value[0].value * 100).toFixed(
          1
        )}% (样本数:${quantity})`;
      }
      return null;
    },
    axisPointer: {
      type: 'shadow',
      label: {
        formatter(params) {
          return params.value?.split('|').shift();
        },
      },
    },
  },
  grid: {
    left: '0%',
    right: '4%',
    top: '1%',
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
    axisLabel: {
      formatter(value) {
        return `${value}%`;
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

const popularityData = {
  all: [],
  dps: [],
  tank: [],
  healer: [],
};
onMounted(async () => {
  popularityData.all = await querySpecPopularity();

  chart.value.init(echarts, chart => {
    updateChart();
  });
});

// 渲染完成
const init = () => {
  console.log('渲染完成');
};

function updateChart() {
  if (popularityData.all?.length) {
    let filterData = popularityData.all;
    if (currentJob.value.value !== 'all') {
      if (popularityData[currentJob.value.value]?.length) {
        filterData = popularityData[currentJob.value.value];
      } else {
        const temp = popularityData.all.filter(
          item => item.role === currentJob.value.value
        );
        const tempTotal = temp.reduce((pre, cur) => {
          pre += cur.quantity;
          return pre;
        }, 0);
        popularityData[currentJob.value.value] = temp.map(item => ({
          ...item,
          percent: (item.quantity / tempTotal).toFixed(4),
        }));
        filterData = popularityData[currentJob.value.value];
      }
    }

    state.option.yAxis.data = [];
    state.option.series[0].data = [];
    filterData.forEach(item => {
      state.option.yAxis.data.unshift(`${item.name_zh}|${item.color}`);
      state.option.series[0].data.unshift((item.percent * 100).toFixed(2));
    });

    chart.value?.setOption(state.option);
    chart.value?.resize();
  }
}

const jobFilters = ref([
  {
    label: '全部',
    value: 'all',
  },
  {
    label: '输出',
    value: 'dps',
  },
  {
    label: '坦克',
    value: 'tank',
  },
  {
    label: '治疗',
    value: 'healer',
  },
]);
const currentJob = ref(jobFilters.value[0]);
const chartStyle = computed(() => {
  if (['all', 'dps'].includes(currentJob.value.value)) {
    return { height: '1200px' };
  }
  return { height: '400px' };
});
function switchJob(job) {
  if (currentJob.value.value !== job.value) {
    currentJob.value = job;
    updateChart();
  }
}
</script>

<style lang="scss" scoped>
::v-deep .uni-card {
  width: 96vw;
  box-sizing: border-box;
  padding: 0 !important;
  margin: 0 auto !important;
  border: none !important;
  background-color: $uni-bg-color-grey-light !important;
}

.filter-container {
  display: flex;
  font-size: 12px;
  align-items: center;
  color: #fff;
  .filter-container__button {
    color: #fff;
    line-height: 24px;
    font-size: 12px;
    margin: 0;
    margin-right: 10rpx;
    border: 1px solid #bbb !important;
    background-color: $uni-bg-color-grey-light;
  }
  .filter-container__button--active {
    color: #fff;
    font-weight: bold;
    background-color: $uni-color-primary;
  }
}
</style>
