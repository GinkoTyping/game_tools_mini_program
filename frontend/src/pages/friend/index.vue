<template>
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
  <uni-load-more status="more"></uni-load-more>
</template>

<script lang="ts" setup>
import { onLoad, onReachBottom } from '@dcloudio/uni-app';
import { ref } from 'vue';

import { ITagCardItem, queryFilterUserTag } from '@/api/wow';
import TagCard from '@/components/TagCard.vue';

const cardList = ref<ITagCardItem[]>([]);
onLoad(async () => {
  await updateCardList();
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
.card-list {
  padding: 20rpx;
  min-height: 100vh;
  .card-item {
    margin-bottom: 20rpx;
  }
  .card-item__collapse {
    margin-bottom: 40rpx;
  }
}
</style>
