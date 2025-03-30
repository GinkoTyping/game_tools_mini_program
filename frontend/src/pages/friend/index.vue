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
        <CustomTag title="国服">
          <template v-slot:suffix>
            <view>。</view>
          </template>
        </CustomTag>
        <CustomTag title="筛选">
          <template v-slot:suffix>
            <view>。</view>
          </template>
        </CustomTag>
      </view>
    </view>

    <uni-transition ref="ani" custom-class="transition" mode-class="fade" show>
      <view
        class="pulldown-result"
        :style="{
          paddingTop: pulldownInfo?.paddingTop,
        }"
      >
        {{ pulldownInfo?.text }}
      </view>
    </uni-transition>

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
  </view>
</template>

<script lang="ts" setup>
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { computed, reactive, ref } from 'vue';

import { IFilterParams, ITagCardItem, queryFilterUserTag } from '@/api/wow';
import TagCard from '@/components/TagCard.vue';
import CustomTag from '@/components/CustomTag.vue';
import FriendFooter from '@/components/FriendFooter.vue';

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
  filter: { wow_game_style: [] },
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
  Result = 'result',
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

    togglePullDownResult();
  }
});
const pulldownInfo = computed(() => {
  switch (pulldownRefresh.status) {
    case LoadingStatus.More:
      return { text: '下拉刷新数据', paddingTop: '70rpx' };
    case LoadingStatus.NoMore:
      return { text: '暂无更多数据', paddingTop: '70rpx' };
    case LoadingStatus.Loading:
      return { text: '数据加载中', paddingTop: '10rpx' };
    case LoadingStatus.Result:
      return {
        text: `铭牌信息已更新, 总计${cardCount.value}张`,
        paddingTop: '110rpx',
      };
    default:
      break;
  }
});
function togglePullDownResult() {
  pulldownRefresh.status = LoadingStatus.Result;
  setTimeout(() => {
    pulldownRefresh.status = LoadingStatus.More;
  }, 3000);
}

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
</script>

<style lang="scss" scoped>
.page-container {
  padding-bottom: 150rpx;
}

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
    height: 60rpx !important;
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

.pulldown-result {
  color: #bbb;
  font-size: 24rpx;
  text-align: center;
}
</style>
