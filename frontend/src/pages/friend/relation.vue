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
    <view
      class="hint"
      v-show="currentFeature === 'interestedByMe' && targetRelations?.length"
      >有收到他们的好友邀请吗？<br />
      如果觉得不错的话，可以主动添加试试噢!</view
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
          :display-battlenet-id="
            ['accepted', 'interestedByMe'].includes(currentFeature)
          "
          v-model:type="item.type"
          @cell-update="() => handleCellUpdate(item.zp_index)"
        />
      </view>
    </view>
  </z-paging>

  <FriendFooter />
  <CustomToast ref="toastRef" />
</template>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';

import {
  queryUserTagByIds,
  queryUserTagRelationByApplicantId,
  queryUserTagRelationByTargetId,
} from '@/api/wow';
import { IRelationItem } from '@/interface/IUserTag';
import FilterHeader from '@/components/FilterHeader.vue';
import FriendFooter from '@/components/FriendFooter.vue';
import TagCard from '@/components/TagCard.vue';
import CustomToast from '@/components/CustomToast.vue';

const vListRef = ref();
const toastRef = ref();
const applicantRelations = ref<IRelationItem[]>();
const targetRelations = ref<IRelationItem[]>();
onLoad(async () => {
  applicantRelations.value = await queryUserTagRelationByApplicantId();
  targetRelations.value = await queryUserTagRelationByTargetId();
  vListRef.value?.reload?.();
});

const relationParams = computed(() => {
  if (['accepted', 'interested'].includes(currentFeature.value)) {
    const validStatus =
      currentFeature.value === 'accepted'
        ? ['accepted']
        : ['pending', 'rejected'];
    const total = applicantRelations.value?.filter(item =>
      validStatus.includes(item.status)
    );
    return {
      ids:
        total
          ?.slice(
            (currentPageNo.value - 1) * currentPageSize.value,
            currentPageNo.value * currentPageSize.value
          )
          ?.map(item => item.tagId) ?? [],
      requireRelation: true,
      count: total?.length,
    };
  }
  if (currentFeature.value === 'interestedByMe') {
    const total = targetRelations.value?.filter(
      item => item.status === 'accepted'
    );
    return {
      userIds:
        total
          ?.slice(
            (currentPageNo.value - 1) * currentPageSize.value,
            currentPageNo.value * currentPageSize.value
          )
          ?.map(item => item.applicantUserId) ?? [],
      requireRelation: false,
      count: total?.length,
    };
  }
  // TODO 申请功能待完善
  return null;
});

const currentPageNo = ref(1);
let currentPageSize = ref(10);
async function queryList(pageNo: number, pageSize: number, from: string) {
  currentPageNo.value = pageNo;
  currentPageSize.value = pageSize;

  if (relationParams.value) {
    const data = await queryUserTagByIds(relationParams.value);
    if (from !== 'load-more' && data.length) {
      toastRef.value.showToast(
        `获取了${relationParams.value?.count ?? 0}张名片`
      );
    }
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
    title: '我获取的',
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

.hint {
  padding: 20rpx;
  padding-bottom: 0;
  color: #fff;
  text-align: center;
  font-size: 26rpx;
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
