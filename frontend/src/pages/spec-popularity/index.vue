<template>
  <view class="main-container">
    <view class="rank-menu">
      <view
        class="rank-menu-item"
        :class="[currentMenu === 'popular' ? 'rank-menu-item--active' : '']"
        @click="() => switchMenu('popular')"
        >热度排行</view
      >
      <view
        class="rank-menu-item"
        :class="[currentMenu === 'rank' ? 'rank-menu-item--active' : '']"
        @click="() => switchMenu('rank')"
        >输出排行</view
      >
    </view>

    <uni-card v-show="currentMenu === 'rank'">
      <view class="rank-container">
        <view class="row header">
          <view class="tags">
            <view class="tag"></view>
            <view class="tag">评级</view>
            <view class="tag">平均</view>
          </view>

        </view>
        <view
          class="row body"
          v-for="row in rankData?.[0]?.rank"
          :key="row.type"
        >
          <view class="tags">
            <view class="tag tag-diff" :class="[diffClass(row.diff)]">{{
              row.diff
            }}</view>
            <view class="tag tag--bg tag-tier" :class="[row.tier]">{{
              row.tier
            }}</view>
            <view class="tag tag--bg" :class="[row.tier]">{{ row.avg }}</view>
          </view>
          <view class="bars-wrap">
            <view
              class="spec-icon"
              :style="{
                backgroundPosition: row.spritePosition,
              }"
            ></view>
            <!-- <view class="spec" :class="[row.classSpec]"></view> -->
            <view class="bars">
              <view
                class="bar-avg"
                :style="{ width: row.avgWidth, backgroundColor: row.color }"
                >{{ row.name }}</view
              >
              <view
                class="bar-top"
                :style="{ width: row.topWidth, backgroundColor: row.color }"
              >
                {{ row.top }}
              </view>
              <view
                class="bar-edge"
                :style="{ left: row.totalWidth, backgroundColor: row.color }"
              ></view>
            </view>
          </view>
        </view>
      </view>
    </uni-card>
    <uni-card v-show="currentMenu === 'popular'">
      <uni-title
        type="h3"
        :title="`更新: ${dataDate}`"
        align="center"
        color="#fff"
      ></uni-title>
      <view class="filter-container">
        <text> 层数： </text>
        <button
          class="filter-container__button"
          :class="[
            currentLevel === item.value
              ? 'filter-container__button--active'
              : '',
          ]"
          v-for="item in levelFilter"
          :key="item.value"
          @click="() => switchLevel(item.value)"
        >
          {{ item.label }}
        </button>
      </view>
      <view class="filter-container">
        <text> 职业： </text>
        <button
          class="filter-container__button"
          :class="[
            currentJob.value === item.value
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

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { onShareAppMessage } from '@dcloudio/uni-app';

import { querySpecDpsRank, querySpecPopularity } from '@/api/wow/index';
import LEchart from '@/components/l-echart/l-echart.vue';
import ShareIcon from '@/components/ShareIcon.vue';

const echarts = require('../../static/echarts.min.js');

let chart = ref(); // 获取dom
const state = reactive<any>({
  option: {},
});

onShareAppMessage(() => ({
  title: '热门专精排行（每日更新）',
  path: 'pages/spec-popularity/index',
}));

state.option = {
  tooltip: {
    trigger: 'axis',
    formatter(value: any) {
      if (value[0]?.axisValue) {
        const name_zh = value[0].axisValue.split('|').shift();
        const quantity = popularityData[currentJob.value.value].find(
          (item: any) => item.name_zh === name_zh
        )?.quantity;
        return `${name_zh}: ${Number(value[0].value).toFixed(
          1
        )}% (样本数:${quantity})`;
      }
      return null;
    },
    axisPointer: {
      type: 'shadow',
      label: {
        formatter(params: any) {
          return params.value?.split('|').shift();
        },
      },
    },
  },

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
      formatter(value: any) {
        return `${value}%`;
      },
    },
  },
  yAxis: {
    type: 'category',
    data: [],
    minInterval: 10,
    axisLabel: {
      formatter(value: any) {
        return value.split('|').shift();
      },
      color(value: any) {
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
      itemStyle: {
        color(params: any) {
          return params.name.split('|').pop();
        },
      },
    },
  ],
};

const popularityData: any = {
  all: [],
  dps: [],
  tank: [],
  healer: [],
};
const dataDate = ref('');
onMounted(async () => {
  await getPopularityData();
  await getSpecRankData();
});

const rankData = ref();
const diffClass = computed(() => {
  return (diff: string) => (diff.includes('↑') ? 'up' : 'down');
});
async function getSpecRankData() {
  const data = await querySpecDpsRank(1);
  rankData.value = data.data;
}

async function getPopularityData() {
  uni.showLoading({
    title: '银子加载中...',
  });
  const [minLevel, maxLevel] = currentLevel.value.split('-');
  const res = await querySpecPopularity(Number(minLevel), Number(maxLevel));
  popularityData.all = res.data;
  popularityData.dps = [];
  popularityData.tank = [];
  popularityData.healer = [];

  dataDate.value = res.date;
  chart.value.init(echarts, () => {
    uni.hideLoading();
    updateChart();
  });
}

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
        (item: any) => item.role === currentJob.value.value
      );
      const tempTotal = temp.reduce((pre: number, cur: any) => {
        pre += cur.quantity;
        return pre;
      }, 0);
      popularityData[currentJob.value.value] = temp.map((item: any) => ({
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
function setData(data: any) {
  state.option.yAxis.data = [];
  state.option.series[0].data = [];
  data.forEach((item: any) => {
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
function switchJob(job: any) {
  if (currentJob.value.value !== job.value) {
    currentJob.value = job;
    updateChart();
  }
}

const levelFilter = [
  {
    label: '全部',
    value: '2-99',
  },
  {
    label: '4-6',
    value: '4-6',
  },
  {
    label: '7-9',
    value: '7-9',
  },
  {
    label: '10-11',
    value: '10-11',
  },
  {
    label: '12+',
    value: '12-99',
  },
];
const currentLevel = ref('2-99');
async function switchLevel(value: any) {
  if (currentLevel.value !== value) {
    currentLevel.value = value;
    await getPopularityData();
  }
}

const currentMenu = ref('rank');
function switchMenu(menuName: any) {
  if (currentMenu.value !== menuName) {
    currentMenu.value = menuName;
    if (currentMenu.value === 'popular') {
      chart.value?.resize();
    }
  }
}
</script>

<style lang="scss" scoped>
.rank-menu {
  display: flex;
  justify-content: space-between;
  border: 1px solid $uni-color-primary;
  position: relative;
  margin: 0 2vw;
  border-radius: 10px;
  overflow: hidden;
  background-color: $uni-bg-color-grey-light;
  color: #fff;
  margin-bottom: 10px;
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    height: 100%;
    width: 2px;
    background-color: $uni-color-primary;
  }
  .rank-menu-item {
    width: 50%;
    height: 100%;
    font-size: 14px;
    font-weight: bold;
    text-align: center;
    padding: 10px 0;
  }
  .rank-menu-item--active {
    background-color: $uni-color-primary;
  }
}
.rank-container {
  .row {
    display: flex;
    font-size: 12px;
    align-items: center;
    height: 20px;
    line-height: 20px;
    .tags {
      height: 100%;
      display: flex;
      margin-right: 6px;
      &:not(:last-child) {
        .tag {
          border-bottom: none;
        }
      }
      view {
        padding: 2px;
        min-width: 30px;
        text-align: center;
        &:first-child {
          border: none;
          min-width: 24px;
        }
      }
      .tag {
        border: 1px solid black;
        box-sizing: border-box;
        &:not(:last-child) {
          border-right: none;
        }
      }
      .up {
        color: $color-uncommon;
      }
      .down {
        color: $uni-color-error;
      }
      .tag-diff {
        background-color: $uni-bg-color-grey-lighter;
        border-bottom: 1px solid $uni-bg-color-grey-light !important;
      }
      .tag--bg {
        color: black;
      }
      .tag-tier {
        font-size: 14px;
        font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
      }
      .S {
        background-color: $color-s-tier;
      }
      .A {
        background-color: $color-a-tier;
      }
      .B {
        background-color: $color-b-tier;
      }
      .C {
        background-color: $color-c-tier;
      }
      .D {
        background-color: $color-d-tier;
      }
      .F {
        background-color: #bbb;
      }
    }
    .bars-wrap {
      display: flex;
      flex: 1;
      align-items: center;
      height: 100%;
      .spec-icon {
        width: 20px;
        height: 20px;
        background-image: url(https://ginkolearn.cyou/api/wow/assets/sprites/spec-sprite.png);
      }
      .bars {
        flex: 1;
        display: flex;
        align-items: center;
        height: 100%;
        background-color: $uni-bg-color-grey-lighter;
        position: relative;
        border-bottom: 1px solid black;
        box-sizing: border-box;
        .bar-avg,
        .bar-top {
          height: 100%;
          box-sizing: border-box;
        }
        .bar-avg {
          padding-left: 4px;
          color: black;
        }
        .bar-top {
          color: black;
          padding-right: 2px;
          text-align: right;
          position: relative;
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(
              0,
              0,
              0,
              0.5
            ); /* 半透明黑色覆盖层，用于变暗效果 */
            z-index: 0;
          }
          text {
            position: absolute;
            right: 0;
            color: #fff;
            z-index: 99;
          }
        }
        .bar-edge {
          position: absolute;
          width: 1px;
          height: 100%;
          background-color: #fff;
        }
      }
    }
  }
  .header {
    .tags {
      .tag {
        border-color: transparent;
      }
    }
  }
}

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
    padding: 0;
    width: 46px;
    text-align: center;
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
