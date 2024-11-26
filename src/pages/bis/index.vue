<template></template>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';

import allData from '@/data/spec-data.json';
import { IWowBIS, ISpceBIS } from '@/interface/IWow';

const bisData = allData as IWowBIS;
const classKey = ref('');
const specKey = ref('');
const currentData = ref<ISpceBIS | null>();
onLoad((options: any) => {
  classKey.value = options.classKey ?? 'death-knight';
  specKey.value = options.specKey ?? 'blood';
  currentData.value = bisData[classKey.value].find(
    item => item.spec === specKey.value
  );
});
</script>

<style lang="scss"></style>
@/interface/IWow
