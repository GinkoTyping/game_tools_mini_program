<template>
  <view class="card-list">
    <view
      v-for="(item, index) in cardList"
      :key="item.user_id"
      class="card-item"
      :class="[item.isCollapse ? 'card-item__collapse' : '']"
    >
      <TagCard :data="item" :type="item.isCollapse ? 'simple' : 'normal'" />
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

  const temp = JSON.parse(JSON.stringify(cardList.value[0]));
  cardList.value.push(JSON.parse(JSON.stringify(temp)));
  cardList.value.push(JSON.parse(JSON.stringify(temp)));
  cardList.value.push(JSON.parse(JSON.stringify(temp)));

  cardList.value[0].isCollapse = true;
  cardList.value[2].isCollapse = true;
});
</script>
<style lang="scss" scoped>
.card-list {
  padding: 20rpx;
  .card-item {
    margin-bottom: 20rpx;
  }
  .card-item__collapse {
    margin-bottom: 40rpx;
  }
}
</style>
