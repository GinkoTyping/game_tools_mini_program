<template></template>

<script lang="ts" setup>
import { queryUserTagRelationByApplicantId } from '@/api/wow';
import { onLoad } from '@dcloudio/uni-app';

onLoad(async () => {
  await queryUserTagRelationByApplicantId();
});
</script>

<style lang="scss" scoped></style>
