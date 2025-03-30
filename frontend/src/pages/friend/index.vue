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

    <uni-load-more
      class="pulldonw-load-more"
      iconSize="18"
      :status="pulldownRefresh.status"
      :contentText="pulldownRefresh"
    ></uni-load-more>

    <uni-transition
      ref="ani"
      custom-class="transition"
      mode-class="fade"
      :show="showPulldownResult"
    >
      <view class="pulldown-result"> 铭牌信息已更新 </view>
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

    <uni-load-more status="more"></uni-load-more>
  </view>
</template>

<script lang="ts" setup>
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { reactive, ref } from 'vue';

import { ITagCardItem, queryFilterUserTag } from '@/api/wow';
import TagCard from '@/components/TagCard.vue';
import CustomTag from '@/components/CustomTag.vue';
import FriendFooter from '@/components/FriendFooter.vue';

//#region 加载
const cardList = ref<ITagCardItem[]>([]);
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

  const params = {
    lastId: -1,
    lastUpdatedAt: '',
  };
  if (isLoadMore && cardList.value) {
    const lastTagCard = cardList.value.slice(-1)[0];
    params.lastId = lastTagCard.id;
    params.lastUpdatedAt = lastTagCard.updated_at;
  }
  const data = await queryFilterUserTag(params);

  if (isLoadMore) {
    cardList.value.push(...data);
  } else {
    cardList.value = data;
  }

  pullupRefresh.status =
    data.length < 10 ? LoadingStatus.NoMore : LoadingStatus.More;
}
// 上拉懒加载数据
onReachBottom(async () => {
  if (pullupRefresh.status === LoadingStatus.More) {
    await updateCardList(true);
  }
});

// 下拉刷新
const pulldownRefresh = reactive({
  status: LoadingStatus.More,
  contentdown: '下拉刷新数据',
});
onPullDownRefresh(async () => {
  if (pulldownRefresh.status === LoadingStatus.More) {
    uni.vibrateShort();
    pulldownRefresh.status = LoadingStatus.Loading;
    await updateCardList(true);
    pulldownRefresh.status = LoadingStatus.More;
    uni.stopPullDownRefresh();

    togglePullDownResult();
  }
});

const showPulldownResult = ref(false);
function togglePullDownResult() {
  if (showPulldownResult.value) {
    showPulldownResult.value = false;
  } else {
    showPulldownResult.value = true;
    setTimeout(() => {
      showPulldownResult.value = false;
    }, 3000);
  }
}

onLoad(async () => {
  await updateCardList();
});
//#endregion

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
  }
}
//#endregion
</script>

<style lang="scss" scoped>
.page-container {
  padding-top: 10rpx;
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
    margin-bottom: 20rpx;
  }

  .card-item__collapse {
    margin-bottom: 40rpx;
  }
}

::v-deep .pulldonw-load-more {
  text {
    font-size: 24rpx !important;
  }
}
.pulldown-result {
  padding-top: 30rpx;
  color: #bbb;
  font-size: 24rpx;
  text-align: center;
}
</style>
