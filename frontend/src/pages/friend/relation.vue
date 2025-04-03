<template>
  <FriendFooter />
</template>

<script lang="ts" setup>
import { queryUserTagRelationByApplicantId } from '@/api/wow';
import { onLoad } from '@dcloudio/uni-app';
import FriendFooter from '@/components/FriendFooter.vue';

onLoad(async () => {
  await queryUserTagRelationByApplicantId();
});
</script>

<style lang="scss" scoped></style>
