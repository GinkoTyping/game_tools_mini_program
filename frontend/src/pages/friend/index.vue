<template>
  <view class="header-filter">
    <view class="left-feature">
      <text class="feature-label feature-label--active">大秘境</text>
      <text class="feature-label">团本</text>
      <text class="feature-label">地下堡</text>
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
  <FriendFooter v-model:menu="currentMenu" />
  <uni-load-more status="more"></uni-load-more>
</template>

<script lang="ts" setup>
import { onLoad, onReachBottom, onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';

import { ITagCardItem, queryFilterUserTag } from '@/api/wow';
import TagCard from '@/components/TagCard.vue';
import CustomTag from '@/components/CustomTag.vue';
import FriendFooter from '@/components/FriendFooter.vue';

const currentMenu = ref('index');
const cardList = ref<ITagCardItem[]>([]);
onLoad(async () => {
  await updateCardList();
});
onShow(() => {
  currentMenu.value = 'index';
});

enum LoadingStatus {
  More = 'more',
  Loading = 'loading',
  NoMore = 'no-more',
}
const loadingStatus = ref<LoadingStatus>(LoadingStatus.More);

async function updateCardList(isLoadMore?: boolean) {
  loadingStatus.value = LoadingStatus.Loading;

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
  cardList.value.push(...data);

  loadingStatus.value =
    data.length < 10 ? LoadingStatus.NoMore : LoadingStatus.More;
}
onReachBottom(async () => {
  if (loadingStatus.value === LoadingStatus.More) {
    console.log('loading');
    await updateCardList(true);
  } else {
  }
});
</script>

<style lang="scss" scoped>
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
  padding-top: 120rpx;
  .card-item {
    margin-bottom: 20rpx;
  }

  .card-item__collapse {
    margin-bottom: 40rpx;
  }
}
</style>
