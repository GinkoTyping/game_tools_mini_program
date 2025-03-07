<template>
  <view class="main-container">
    <uni-card>
      <uni-title
        type="h3"
        title="每日更新"
        align="center"
        color="#fff"
      ></uni-title>

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

      <view class="chart-container" :style="chartStyle">
        <LEchart ref="chart" @finished="init"></LEchart>
      </view>
    </uni-card>

    <uni-card>
      <ad-custom unit-id="adunit-79a3e360c99b34ab"></ad-custom>
    </uni-card>
  </view>

  <ShareIcon />
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { onShareAppMessage } from '@dcloudio/uni-app';

import { querySpecPopularity } from '@/api/wow/index';
import LEchart from '@/components/l-echart/l-echart.vue';
import ShareIcon from '@/components/ShareIcon.vue';

const echarts = require('../../static/echarts.min.js');

let chart = ref(); // 获取dom
const state = reactive({
  option: {},
});

onShareAppMessage(() => ({
  title: '热门专精排行（每日更新）',
  path: 'pages/spec-popularity/index',
}));

state.option = {
  grid: {
    left: '0%',
    right: '4%',
    top: '1%',
    // charts超高时，需要预留广告位的空间，否则广告会覆盖chart
    bottom: 140,
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
  uni.showLoading({
    title: '银子加载中...',
  });
  popularityData.all = await querySpecPopularity();

  chart.value.init(echarts, chart => {
    uni.hideLoading();
    updateChart();
  });
});

// 渲染完成
const init = () => {
  console.log('渲染完成');
};

function filterDataByJob() {
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
  return filterData;
}
function setGridBottom() {
  if (['all', 'dps'].includes(currentJob.value.value)) {
    state.option.grid.bottom = 140;
  } else {
    state.option.grid.bottom = 20;
  }
}
function setData(data) {
  state.option.yAxis.data = [];
  state.option.series[0].data = [];
  data.forEach(item => {
    state.option.yAxis.data.unshift(`${item.name_zh}|${item.color}`);
    state.option.series[0].data.unshift((item.percent * 100).toFixed(2));
  });
}
function updateChart() {
  if (popularityData.all?.length) {
    const filterData = filterDataByJob();
    setGridBottom();
    setData(filterData);

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
  switch (currentJob.value.value) {
    case 'all':
      return { height: '1400px' };
    case 'dps':
      return { height: '1000px' };

    default:
      return { height: '300px' };
  }
});
function switchJob(job) {
  if (currentJob.value.value !== job.value) {
    currentJob.value = job;
    updateChart();
  }
}
</script>

<style lang="scss" scoped>
.main-container {
  padding-top: 1rem;
}

::v-deep .uni-card {
  width: 96vw;
  box-sizing: border-box;
  padding: 0 !important;
  margin: 0 auto !important;
  border: none !important;
  background-color: $uni-bg-color-grey-light !important;
}

.filter-container {
  margin-top: 0.4rem;
  margin-bottom: 0.4rem;
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
