<template>
  <view class="page-container">
    <view class="header-filter">
      <view class="left-feature">
        <text
          v-for="feature in featureFilters"
          :key="feature.value"
          class="feature-label"
          :class="[
            currentFeature === feature.value ? ' feature-label--active' : '',
          ]"
          @click="() => switchFeature(feature.value)"
          >{{ feature.title }}</text
        >
      </view>
      <view class="right-drop-down">
        <CustomTag title="筛选">
          <template v-slot:suffix>
            <view>↓</view>
          </template>
        </CustomTag>
      </view>
    </view>

    <uni-load-more
      class="pulldown-load-more"
      :showIcon="false"
      :status="pulldownRefresh.status"
    ></uni-load-more>

    <view class="card-list">
      <view
        v-for="(item, index) in cardList"
        :key="item.id"
        class="card-item"
        :class="[item.type ? 'card-item__collapse' : '']"
      >
        <TagCard :data="item" v-model:type="item.type" />
      </view>
    </view>

    <FriendFooter />

    <uni-load-more
      class="reach-bottom-load-more"
      :status="pullupRefresh"
    ></uni-load-more>

    <view class="filter-page">
      <FilterPage />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { computed, reactive, ref } from 'vue';

import { IFilterParams, ITagCardItem, queryFilterUserTag } from '@/api/wow';
import TagCard from '@/components/TagCard.vue';
import CustomTag from '@/components/CustomTag.vue';
import FriendFooter from '@/components/FriendFooter.vue';
import FilterPage from '@/components/FilterPage.vue'

//#region 过滤栏
const currentFeature = ref('all');
const featureFilters = ref([
  {
    title: '最新',
    value: 'all',
  },
  {
    title: '大秘境',
    value: 'mythic',
  },
  {
    title: '团本',
    value: 'raid',
  },
  {
    title: '地下堡',
    value: 'delves',
  },
]);
function switchFeature(value: string) {
  if (currentFeature.value !== value) {
    currentFeature.value = value;
    setGameStyleFilter();
  }
}

const filterParams = reactive<IFilterParams>({
  filter: { wow_game_style: [], wow_jobs: [] },
  lastId: -1,
  lastUpdatedAt: '',
});
async function setGameStyleFilter() {
  let output;
  switch (currentFeature.value) {
    case 'all':
      output = [];
      break;
    case 'mythic':
    case 'raid':
    case 'delves':
      output = [currentFeature.value];
      break;
    default:
      output = [];
      break;
  }
  filterParams.filter.wow_game_style = output;

  // 重置分页参数
  filterParams.lastId = -1;
  filterParams.lastUpdatedAt = '';

  uni.startPullDownRefresh();
  uni.pageScrollTo({ scrollTop: 0 });
}
//#endregion

//#region 加载
const cardList = ref<ITagCardItem[]>([]);
const cardCount = ref<number>();
enum LoadingStatus {
  More = 'more',
  Loading = 'loading',
  NoMore = 'no-more',
}
const pullupRefresh = reactive({
  status: LoadingStatus.More,
});
async function updateCardList(isLoadMore?: boolean) {
  pullupRefresh.status = LoadingStatus.Loading;

  if (isLoadMore && cardList.value) {
    const lastTagCard = cardList.value.slice(-1)[0];
    filterParams.lastId = lastTagCard.id;
    filterParams.lastUpdatedAt = lastTagCard.updated_at;
  }
  const { data, total } = await queryFilterUserTag(filterParams);
  cardCount.value = total;
  if (isLoadMore) {
    cardList.value.push(...data);
  } else {
    uni.showToast({
      title: `获取了${total}张铭牌`,
      icon: 'none',
    });
    cardList.value = data;
  }

  pullupRefresh.status =
    data.length < 10 ? LoadingStatus.NoMore : LoadingStatus.More;
}

// 下拉刷新
const pulldownRefresh = reactive({
  status: LoadingStatus.More,
});
onPullDownRefresh(async () => {
  if (pulldownRefresh.status === LoadingStatus.More) {
    uni.vibrateShort();
    pulldownRefresh.status = LoadingStatus.Loading;
    await updateCardList();
    pulldownRefresh.status = LoadingStatus.More;
    uni.stopPullDownRefresh();
  }
});

// 上拉懒加载数据
onReachBottom(async () => {
  if (pullupRefresh.status === LoadingStatus.More) {
    await updateCardList(true);
  }
});

onLoad(async () => {
  await updateCardList();
});
//#endregion

//#region 过滤页面
const filterOptions = ref([
  {
    title: '基本信息',
    value: 'wow',
    children: [
      {
        index: 6,
        text: '服务器',
        value: 'server',
        options: [
          {
            text: '国服',
            value: 'china',
          },
          {
            text: '亚服',
            value: 'aisa',
          },
          {
            text: '美服',
            value: 'america',
          },
          {
            text: '欧服',
            value: 'europe',
          },
        ],
      },
      {
        index: 0,
        text: '职责',
        value: 'jobs',
        options: [
          {
            text: '坦克',
            value: 'tank',
          },
          {
            text: '治疗',
            value: 'healer',
          },
          {
            text: '输出',
            value: 'dps',
          },
        ],
      },
    ],
  },
  {
    title: '基本信息1',
    value: 'wow1',
    children: [
      {
        index: 6,
        text: '服务器',
        value: 'server',
        options: [
          {
            text: '国服',
            value: 'china',
          },
          {
            text: '亚服',
            value: 'aisa',
          },
          {
            text: '美服',
            value: 'america',
          },
          {
            text: '欧服',
            value: 'europe',
          },
        ],
      },
      {
        index: 0,
        text: '职责',
        value: 'jobs',
        options: [
          {
            text: '坦克',
            value: 'tank',
          },
          {
            text: '治疗',
            value: 'healer',
          },
          {
            text: '输出',
            value: 'dps',
          },
        ],
      },
    ],
  },
  {
    title: '基本信息2',
    value: 'wow2',
    children: [
      {
        index: 6,
        text: '服务器',
        value: 'server',
        options: [
          {
            text: '国服',
            value: 'china',
          },
          {
            text: '亚服',
            value: 'aisa',
          },
          {
            text: '美服',
            value: 'america',
          },
          {
            text: '欧服',
            value: 'europe',
          },
        ],
      },
      {
        index: 0,
        text: '职责',
        value: 'jobs',
        options: [
          {
            text: '坦克',
            value: 'tank',
          },
          {
            text: '治疗',
            value: 'healer',
          },
          {
            text: '输出',
            value: 'dps',
          },
        ],
      },
    ],
  },
]);
//#endregion
</script>

<style lang="scss" scoped>
.page-container {
  padding-bottom: 150rpx;
  position: relative;
}

// 过滤页面
$filter-main-color: #262629;
.filter-page {
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
}

// 主页面
$header-bg-color: #1d1d1f;

.header-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  z-index: 9;
  top: 0;
  padding: 20rpx;
  width: 100vw;
  box-sizing: border-box;
  color: #bbb;
  background-color: $header-bg-color;

  .left-feature {
    font-size: 24rpx;

    .feature-label {
      margin-right: 24rpx;
    }

    .feature-label--active {
      color: #fff;
      font-size: 26rpx;
    }
  }

  .right-drop-down {
    display: flex;
    align-items: center;
  }
}

::v-deep .right-drop-down {
  .tag-button {
    margin-left: 12rpx;
  }
}

.card-list {
  padding: 20rpx;
  padding-top: 0;

  .card-item {
    &:not(:last-child) {
      margin-bottom: 20rpx;
    }
  }

  .card-item__collapse {
    &:not(:last-child) {
      margin-bottom: 40rpx;
    }
  }
}

::v-deep .pulldown-load-more {
  view {
    height: 120rpx !important;
  }

  text {
    font-size: 24rpx !important;
  }
}

::v-deep .reach-bottom-load-more {
  view {
    height: 60rpx;
  }
}

.pulldown-result-wrapper {
  position: fixed;
  top: 80rpx; // 根据header实际高度调整
  left: 0;
  right: 0;
  z-index: 9;
  height: 60rpx; // 固定高度
  overflow: hidden;
  .pulldown-result {
    font-size: 24rpx;
    color: #bbb;
    text-align: center;
    transition: transform 0.3s ease;
  }
}
</style>
