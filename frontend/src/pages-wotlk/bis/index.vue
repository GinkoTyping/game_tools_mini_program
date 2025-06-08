<script setup lang="ts">

import { onLoad } from '@dcloudio/uni-app';
import { queryBis } from '@/api/wow-wotlk';
import { nextTick, ref } from 'vue';
import { useNavigator } from '@/hooks/navigator';

const classKey = ref('');
const specKey = ref('');
const currentData = ref<any>();
const query = ref<any>({});
const navigator = useNavigator();

function setNaviTitle(title: string) {
  uni.setNavigationBarTitle({ title: title });
}

onLoad(async (options: any) => {
  query.value = options;
  classKey.value = options.classKey ?? 'death-knight';
  specKey.value = options.specKey ?? 'blood';

  uni.showLoading({
    title: '银子加载中...',
    mask: true,
  });

  // TODO 加载页面完成前，需要展示loading
  currentData.value = await queryBis(query.value.classKey, query.value.specKey, query.value.type);

  uni.hideLoading();

  setNaviTitle(`${options.title} ${currentData.value.version}`);
});
</script>

<template>
  BIS;
</template>

<style scoped lang="scss">

</style>
