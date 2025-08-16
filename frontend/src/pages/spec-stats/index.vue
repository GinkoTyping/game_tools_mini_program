<template>
  <view class="main-container">
    <view class="menu-placeholder"></view>
    <view class="rank-menu">
      <view
        class="rank-menu-item"
        :class="[currentMenu === 'rank' ? 'rank-menu-item--active' : '']"
        @click="() => switchMenu('rank')"
      >输出伤害
      </view
      >

      <view
        class="rank-menu-item"
        :class="[currentMenu === 'popular' ? 'rank-menu-item--active' : '']"
        @click="() => switchMenu('popular')"
      >专精热度
      </view
      >

      <view
        class="rank-menu-item"
        :class="[currentMenu === 'overall' ? 'rank-menu-item--active' : '']"
        @click="() => switchMenu('overall')"
      >综合排行
      </view
      >

      <view
        class="rank-menu-item"
        :class="[currentMenu === 'dpswow' ? 'rank-menu-item--active' : '']"
        @click="() => switchMenu('dpswow')"
      >输出模拟
      </view
      >
    </view>

    <uni-card v-show="currentMenu === 'rank'">
      <view class="rank-title">
        <view>仅
          <text>{{ currentRankLevel }}</text>
          的数据
        </view>
        <view>{{ `${
          currentWeek === thisWeek
            ? `, 上次更新: ${
              calculateRelativeTime(currentRankUpdatedAt) ?? '加载中...'
            }`
            : ''
        }` }}
        </view>
      </view>

      <view class="filter-container">
        <text> 时间：</text>
        <button
          class="filter-container__button"
          :class="[
            currentWeek === item.value
              ? 'filter-container__button--active'
              : '',
          ]"
          v-for="item in rankWeekOptions"
          :key="item.value"
          @click="() => switchRankWeek(item.value)"
        >
          {{ item.label }}
        </button>
      </view>
      <view class="filter-container">
        <text> 职业：</text>
        <button
          class="filter-container__button"
          :class="[
            currentRankJob === item.value
              ? 'filter-container__button--active'
              : '',
          ]"
          v-for="item in rankJobFilter"
          :key="item.value"
          @click="() => switchRankJob(item.value)"
        >
          {{ item.label }}
        </button>
      </view>
      <view class="rank-container">
        <view class="row header">
          <view class="tags">
            <view class="tag"></view>
            <view class="tag">评级</view>
            <view class="tag">平均</view>
            <view class="tag">最高</view>
            <view class="tag" v-show="currentRankJob !== 'dps'">次数</view>
          </view>
        </view>
        <view class="row body" v-for="row in currentRankData" :key="row.type">
          <view class="tags">
            <view class="tag tag-diff" :class="[diffClass(row.diff)]">{{
                row.diff
              }}
            </view>
            <view class="tag tag--bg tag-tier" :class="[row.tier]">{{
                row.tier
              }}
            </view>
            <view class="tag tag--bg" :class="[row.tier]">{{ row.avg }}</view>
            <view class="tag tag--bg" :class="[row.tier]">{{ row.top }}</view>
            <view
              class="tag tag--bg"
              v-show="currentRankJob !== 'dps'"
              :class="[row.tier]"
            >{{ row.runs }}
            </view
            >
          </view>
          <view class="bars-wrap" @click="() => comfirmToSpecBis(row)">
            <view
              class="spec-icon"
              :style="{
                backgroundPosition: row.spritePosition,
              }"
            ></view>
            <view class="bars">
              <view
                class="bar-avg"
                :style="{ width: row.avgWidth, backgroundColor: row.color }"
              >{{ row.name
                }}
                <text v-show="currentRankJob === 'dps'"
                >({{ row.runs }}次)
                </text
                >
              </view
              >
              <view
                class="bar-top"
                :style="{ width: row.topWidth, backgroundColor: row.color }"
              >
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
        type="h4"
        :title="`本周CD的数据, 上次更新: ${relativeTime(dataDate)}`"
        align="center"
        color="#fff"
      ></uni-title>
      <view class="filter-container">
        <text> 层数：</text>
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
        <text> 职业：</text>
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
      <view class="rank-container">
        <view class="row header">
          <view class="tags">
            <view class="tag">数量</view>
            <view class="tag">职业</view>
          </view>
        </view>
        <view
          class="row body"
          v-for="row in popularityData[currentJob.value]"
          :key="row.type"
        >
          <view class="tags">
            <view class="tag tag-diff">{{ row.quantityText }}</view>
            <view class="tag" :class="[row.class_name_en.toLowerCase()]">{{
                row.name_zh
              }}
            </view>
          </view>
          <view class="bars-wrap" @click="() => comfirmToSpecBis(row)">
            <view
              class="spec-icon"
              :style="{
                backgroundPosition: row.spritePosition,
              }"
            ></view>
            <view class="bars">
              <view
                class="bar-avg"
                :style="{
                  width: popularSpecBarWidth(row),
                  backgroundColor: row.color,
                }"
              ></view>
            </view>
          </view>
        </view>
      </view>
    </uni-card>

    <OverallRankPage ref="overallRankPageRef" v-show="currentMenu === 'overall'" />
    <DpsWowPage v-show="currentMenu === 'dpswow'" />
  </view>

  <ad-custom
    v-if="!['dpswow'].includes(currentMenu)"
    unit-id="adunit-79a3e360c99b34ab"
    style="margin: 1rem 0"
  ></ad-custom>

  <uni-card v-if="['rank', 'popular'].includes(currentMenu)">
    <uni-title type="h4" title="排行说明：" color="#bbb"></uni-title>
    <view class="info-text" v-show="currentMenu === 'rank'"
    >- 每周CD前两天，因为样本数较少，所以排名可能有波动。
      <text
        class="info-text--strong"
      >每4小时
      </text
      >
      更新一次数据（来源mythicstats）；
    </view
    >
    <view class="info-text" v-show="currentMenu === 'rank'"
    >-
      <text class="info-text--strong">每秒伤害</text>
      =
      整个副本期间造成的伤害 / 完成副本的时间(包括脱战的时间)；
    </view
    >
    <view class="info-text" v-show="currentMenu === 'rank'"
    >-
      <text class="info-text--strong">评级：
      </text
      >
      仅依据平均的每秒伤害从高到低排名，所以并不意味着
      <text
        class="info-text--strong"
      >排名F
      </text
      >
      的职业一定很差，单纯是每秒伤害低；如果您想查看综合能力的专精排行，可以
      <text
        class="info-text--highlight"
        @click="toSpecTierPage"
      >点击查看专精排行
      </text
      >
      页面
    </view
    >
    <view class="info-text"
    >- 查看专精攻略： 点击对应专精的
      <text class="info-text--strong"
      >统计条
      </text
      >
      ，即可查看专精攻略，包括BIS配装、属性优先级、天赋和专属攻略等；
    </view
    >
  </uni-card>

  <view class="footer"></view>

  <uni-popup ref="dialog" type="dialog">
    <uni-popup-dialog
      type="warn"
      cancelText="等会儿"
      confirmText="去看看"
      title="提示"
      :content="dialogContent"
      @confirm="dialogConfirm"
    >
      <template v-slot>
        <view class="dialog-content">
          去看看
          <text class="dialog-content_text--highlight"
          >{{ currentSpec?.name_zh }}-{{ currentSpec?.class_name_zh }}
          </text
          >
          的天赋、属性优先级、BIS和专属攻略等。
        </view>
      </template>
    </uni-popup-dialog>
  </uni-popup>
  <ShareIcon />
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import { onShareAppMessage } from '@dcloudio/uni-app';

import { querySpecDpsRank, querySpecPopularity } from '@/api/wow';
import ShareIcon from '@/components/ShareIcon.vue';
import OverallRankPage from '@/pages/spec-stats/components/OverallRank.vue';
import DpsWowPage from '@/pages/spec-stats/components/DpsWow.vue';
import { getWeekCount } from '@/utils/wow';
import { useNavigator } from '@/hooks/navigator';
import { calculateRelativeTime } from '@/utils/time';

const navigator = useNavigator();
onShareAppMessage(() => ({
  title: '专精排行',
  path: 'pages/spec-stats/index',
}));

const currentMenu = ref('rank');

const overallRankPageRef = ref<any>();

function switchMenu(menuName: any) {
  if (currentMenu.value !== menuName) {
    currentMenu.value = menuName;
  }
  if (menuName === 'overall') {
    nextTick(() => {
      overallRankPageRef.value?.initPage();
    });
  }
}

const dialog = ref();
const dialogContent = ref();
const currentSpec = ref();

function comfirmToSpecBis(specData) {
  currentSpec.value = specData;
  nextTick(() => {
    dialog.value?.open?.();
  });
}

function dialogConfirm() {
  navigator.toSpecDetail(
    currentSpec.value.roleClass,
    currentSpec.value.classSpec,
  );
}

const relativeTime = computed(() => {
  return (time: string) => calculateRelativeTime(time);
});

//#region 专精热门度
const popularityData: any = reactive({
  all: [],
  dps: [],
  tank: [],
  healer: [],
});
const dataDate = ref('');

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
  res.data.forEach(item => {
    if (item.role === 'dps') {
      popularityData.dps.push(item);
    } else if (item.role === 'tank') {
      popularityData.tank.push(item);
    } else if (item.role === 'healer') {
      popularityData.healer.push(item);
    } else {
      console.log(`异常的职业类型: ${item.role}`);
    }
  });

  dataDate.value = res.date;

  uni.hideLoading();
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
const currentJob = ref(jobFilters.value[1]);

function switchJob(job: any) {
  if (currentJob.value.value !== job.value) {
    currentJob.value = job;
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
const popularSpecBarWidth = computed(() => {
  return item => {
    return currentJob.value.value === 'all' ? item.allWidth : item.roleWidth;
  };
});

async function switchLevel(value: any) {
  if (currentLevel.value !== value) {
    currentLevel.value = value;
    await getPopularityData();
  }
}

//#endregion

//#region 输出排名
// 过滤配置
const rankJobFilter = [
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
];
const currentRankJob = ref('dps');
const currentRankData = computed(() => {
  return (
    rankData.value?.find(item => item.type === currentRankJob.value)?.rank ?? []
  );
});

function switchRankJob(job: string) {
  if (currentRankJob.value !== job) {
    currentRankJob.value = job;
  }
}

const rankWeekOptions = ref(
  new Array(getWeekCount())
    .fill(1)
    .map((item, index, array) => {
      let label: string;
      if (index === array.length - 1) {
        label = '本周';
      } else if (index === array.length - 2) {
        label = `上周`;
      } else {
        label = `第${index + 1}周`;
      }
      return {
        label,
        value: index + 1,
      };
    })
    .reverse()
    .slice(0, 5),
);

const currentWeek = ref<number>();
const thisWeek = rankWeekOptions.value?.[0].value;
currentWeek.value = rankWeekOptions.value?.[0].value;

async function switchRankWeek(week: number) {
  if (currentWeek.value !== week) {
    currentWeek.value = week;
    await getSpecRankData();
  }
}

// 数据获取
const rankData = ref();
const currentRankUpdatedAt = ref('');
const currentRankLevel = ref('');
const diffClass = computed(() => {
  return (diff: string) => (diff.includes('↑') ? 'up' : 'down');
});

async function getSpecRankData() {
  if (currentWeek.value) {
    uni.showLoading({
      title: '银子加载中...',
    });

    const data = await querySpecDpsRank(currentWeek.value);
    rankData.value = data.data;
    currentRankUpdatedAt.value = data.currentUpdatedAt;
    currentRankLevel.value = data.name;

    uni.hideLoading();
  }
}

function toSpecTierPage() {
  currentMenu.value = 'overall';
}

//#endregion

onMounted(() => {
  getPopularityData();
  getSpecRankData();
});
</script>

<style lang="scss" scoped>
.rank-title {
  text-align: center;
  color: #fff;
  font-size: 28rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: center;

  text {
    color: $uni-color-primary;
    font-size: 32rpx;
    font-weight: bold;
  }
}

.menu-placeholder {
  height: 120rpx;
}

.rank-menu {
  display: flex;
  position: fixed;
  top: 20rpx;
  z-index: 99;
  width: calc(100vw - 4vw);
  box-sizing: border-box;
  justify-content: space-between;
  border: 1px solid $uni-color-primary;
  border-radius: 10px;
  overflow: hidden;
  background-color: $uni-bg-color-grey-light;
  color: #fff;
  margin: 0 2vw 10px;

  .rank-menu-item {
    width: 50%;
    height: 100%;
    font-size: 14px;
    font-weight: bold;
    text-align: center;
    padding: 10px 0;

    &:not(:last-child) {
      border-right: 4rpx solid $uni-color-primary;
    }
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
        width: 30px;
        text-align: center;

        &:first-child {
          border: none;
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
        width: 30px;
        font-size: 10px;
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
          overflow: hidden;

          text {
            font-size: 10px;
          }
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
            background-color: rgba(0, 0, 0, 0.5);
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

  .body:nth-child(2) .bars {
    &::after {
      content: '看攻略';
      color: #bbb;
      position: absolute;
      right: 4px;
      top: 0;
    }
  }
}

.info-text {
  color: #bbb;
}

.info-text--strong {
  font-size: 16px;
  font-weight: bold;
}

.info-text--highlight {
  color: $uni-text-color-inverse;
  font-weight: bold;
  font-size: 16px;
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

.dialog-content {
  font-size: 14px;

  .dialog-content_text--highlight {
    font-weight: bold;
    font-size: 16px;
  }
}

.footer {
  height: 5rem;
  width: 1vw;
}
</style>
