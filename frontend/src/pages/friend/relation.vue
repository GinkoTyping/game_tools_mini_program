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
    <template #top>
      <FilterHeader
        v-model:current="currentFeature"
        v-model:filters="featureFilters"
        @change="switchFeature"
      >
      </FilterHeader>
    </template>
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
import { computed, ref } from 'vue';

import {
  queryUserTagByIds,
  queryUserTagRelationByApplicantId,
} from '@/api/wow';
import { IRelationItem } from '@/interface/IUserTag';
import FilterHeader from '@/components/FilterHeader.vue';
import FriendFooter from '@/components/FriendFooter.vue';
import TagCard from '@/components/TagCard.vue';

const vListRef = ref();
const applicantRelations = ref<IRelationItem[]>();
onLoad(async () => {
  applicantRelations.value = await queryUserTagRelationByApplicantId();
  vListRef.value?.reload?.();
});

const currentRelations = computed(() => {
  if (['accepted', 'interested'].includes(currentFeature.value)) {
    const validStatus =
      currentFeature.value === 'accepted'
        ? ['accepted']
        : ['pending', 'rejected'];
    return (
      applicantRelations.value?.filter(item =>
        validStatus.includes(item.status)
      ) ?? []
    );
  }

  // TODO 申请功能待完善
  return [];
});

async function queryList(pageNo: number, pageSize: number, from: string) {
  console.log('Querying list with params:', pageNo, pageSize, from);
  if (currentRelations.value?.length) {
    const data = await queryUserTagByIds({
      ids: currentRelations.value
        .slice((pageNo - 1) * pageSize, pageNo * pageSize)
        .map(item => item.tagId),
      requireRelation: true,
    });
    vListRef.value?.complete(data);
  } else {
    vListRef.value?.complete([]);
  }
}

const virtualList = ref();
function virtualListChange(vList) {
  virtualList.value = vList;
}
function handleCellUpdate(index: number) {
  vListRef.value?.didUpdateVirtualListCell?.(index);
}

//#region  过滤栏
const currentFeature = ref('accepted');
const featureFilters = ref([
  {
    title: '已获取',
    value: 'accepted',
  },
  {
    title: '对我感兴趣的',
    value: 'interestedByMe',
  },
  // TODO: 申请的功能待完成
  // {
  //   title: '我感兴趣的',
  //   value: 'interested',
  // },
]);

function switchFeature() {
  vListRef.value?.reload?.();
}
//#endregion
</script>

<style lang="scss" scoped>
::v-deep .header-filter {
  height: 100rpx;
}

.card-list {
  display: flex;
  flex-direction: column;
  padding: 20rpx;
  gap: 30rpx;
}

::v-deep .z-paging-content {
  .zp-scroll-view-container {
    top: 100rpx;
    height: calc(100% - 100rpx - 140rpx);
  }
}
</style>
