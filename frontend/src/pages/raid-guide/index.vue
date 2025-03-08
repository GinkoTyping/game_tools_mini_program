<template></template>

<script lang="ts" setup>
import { queryRaidGuide } from '@/api/wow';
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';

const raidData = ref();
onLoad(async () => {
  raidData.value = await queryRaidGuide();
});
</script>
<style lang="scss" scoped></style>
