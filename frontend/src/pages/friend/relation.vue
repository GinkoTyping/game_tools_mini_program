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
  </z-paging>

  <FriendFooter />
</template>

<script lang="ts" setup>
import { queryUserTagRelationByApplicantId } from '@/api/wow';
import { onLoad } from '@dcloudio/uni-app';
import FriendFooter from '@/components/FriendFooter.vue';
import { ref } from 'vue';

const vListRef = ref();
const relationList = ref([]);
onLoad(async () => {
  await queryUserTagRelationByApplicantId();
  console.log('Page loaded and data fetched.');
  vListRef.value?.reload?.();
});

function queryList(pageNo: number, pageSize: number, from: string) {
  console.log('Querying list with params:', pageNo, pageSize, from);
}
function virtualListChange() {}
</script>

<style lang="scss" scoped></style>
