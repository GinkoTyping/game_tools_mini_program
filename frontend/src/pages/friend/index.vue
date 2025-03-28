<template>
  <view class="card-list">
    <view
      class="card-item"
      v-for="(item, index) in cardList"
      :key="item.user_id"
    >
      <TagCard :data="item" :type="index === 0 ? 'simple' : 'normal'" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { queryFilterUserTag } from '@/api/wow';
import TagCard from '@/components/TagCard.vue';
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';

const cardList = ref();
onLoad(async () => {
  cardList.value = await queryFilterUserTag();
  cardList.value.push(cardList.value[0]);
  cardList.value.push(cardList.value[0]);
  cardList.value.push(cardList.value[0]);
});
</script>
<style lang="scss" scoped>
.card-list {
  padding: 20rpx;
  .card-item {
    margin-bottom: 20rpx;
  }
}
</style>
