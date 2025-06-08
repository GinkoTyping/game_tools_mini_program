<script setup lang="ts">

import { onLoad } from '@dcloudio/uni-app';
import { queryBis } from '@/api/wow-wotlk';
import { nextTick, ref } from 'vue';
import WotlkTalentTree from '@/pages-wotlk/components/WotlkTalentTree/index.vue';

const classKey = ref('');
const specKey = ref('');
const currentData = ref<any>();
const query = ref<any>({});

function setNaviTitle(title: string) {
  let menu = '';
  const type = query.value.type;
  if (type === 'dps') {
    menu = '输出';
  } else if (type === 'tank') {
    menu = '坦克';
  } else if (type === 'healer') {
    menu = '治疗';
  }
  uni.setNavigationBarTitle({ title: `${query.value.title} ${menu}` });
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

  setNaviTitle();
});
</script>

<template>
  <WotlkTalentTree
    :data="currentData?.talent_groups?.[0].talents"
    :role-class="currentData?.role_class"
    :selected="currentData?.talent?.build?.talent?.[0]"
  />
</template>

<style scoped lang="scss">

</style>
