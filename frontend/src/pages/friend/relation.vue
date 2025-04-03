<template>
  <z-paging
    ref="vListRef"
    :auto="false"
    use-virtual-list
    cell-height-mode="dynamic"
    :force-close-inner-list="true"
    @virtualListChange="virtualListChange"
    @query="queryList"
  >
    <view class="card-list">
      <view
        :id="`zp-id-${item.zp_index}`"
        :key="item.zp_index"
        v-for="(item, index) in virtualList"
        class="card-item"
      >
        <TagCard
          :data="item"
          v-model:type="item.type"
          @cell-update="() => handleCellUpdate(item.zp_index)"
        />
      </view>
    </view>
  </z-paging>

  <FriendFooter />
</template>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';

import {
  queryUserTagByIds,
  queryUserTagRelationByApplicantId,
} from '@/api/wow';
import FriendFooter from '@/components/FriendFooter.vue';
import { IRelationItem } from '@/interface/IUserTag';
import TagCard from '@/components/TagCard.vue';

const vListRef = ref();
const relationList = ref<IRelationItem[]>();
onLoad(async () => {
  relationList.value = await queryUserTagRelationByApplicantId();
  vListRef.value?.reload?.();
});

async function queryList(pageNo: number, pageSize: number, from: string) {
  console.log('Querying list with params:', pageNo, pageSize, from);
  if (!relationList.value) {
    return;
  }
  const data = await queryUserTagByIds({
    ids: relationList.value
      .slice((pageNo - 1) * pageSize, pageNo * pageSize)
      .map(item => item.tagId),
  });
  vListRef.value?.complete(data);
}

const virtualList = ref();
function virtualListChange(vList) {
  virtualList.value = vList;
}
function handleCellUpdate(index: number) {
  vListRef.value?.didUpdateVirtualListCell?.(index);
}
</script>

<style lang="scss" scoped>
.card-list {
  display: flex;
  flex-direction: column;
  padding: 20rpx;
  gap: 30rpx;
}
</style>
