<script setup lang="ts">
import { computed, ref } from 'vue';

import { onLoad } from '@dcloudio/uni-app';
import { queryBis } from '@/api/wow-wotlk';
import WotlkTalentTree from '@/pages-wotlk/components/WotlkTalentTree/index.vue';
import SpecFooter from '@/components/SpecFooter.vue';
import labels from '@/data/zh.json';

const classKey = ref('');
const specKey = ref('');
const currentData = ref<any>();
const query = ref<any>({});

// region 天赋树
const selectedTreeIndex = ref(0);
const talentTrees = computed(() => {
  return currentData.value?.talent_groups.map(item => labels[currentData.value?.role_class][item.slug]);
});

function switchTreeIndex({ currentIndex }) {
  if (selectedTreeIndex.value !== currentIndex) {
    selectedTreeIndex.value = currentIndex;
  }
}

const selectedTalentTree = computed(() => {
  return currentData.value?.talent_groups?.[selectedTreeIndex.value].talents;
});
const selectedTalentNodes = computed(() => {
  return currentData.value?.talent?.[activeMenu.value === 'leveling' ? 'leveling' : 'build']?.talent?.[selectedTreeIndex.value];
});

// endregion

//#region 切换底部菜单
const activeMenu = ref('leveling');
const footerMenus = [
  {
    title: '练级',
    value: 'leveling',
    icon: 'icon-dungeon',
  },
  {
    title: '分享',
    value: 'share',
    icon: 'icon-share',
  },
  {
    title: '满级',
    value: 'build',
    icon: 'icon-Crown-',
  },
];

async function onMenuChange(menuValue: string) {
  console.log(menuValue);
}

//#endregion

function setNaviTitle() {
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
  <view class="main">
    <uni-segmented-control
      class="tree-menus"
      :current="selectedTreeIndex"
      :values="talentTrees"
      style-type="text"
      active-color="#007aff"
      @clickItem="switchTreeIndex"
    />

    <WotlkTalentTree
      class="tree-container"
      :data="selectedTalentTree"
      :role-class="currentData?.role_class"
      :selected="selectedTalentNodes"
    />
  </view>


  <SpecFooter
    v-model="activeMenu"
    :menus="footerMenus"
    @change="onMenuChange"
  />
</template>

<style scoped lang="scss">
.main {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
  padding-bottom: 160rpx;
}

:deep {
  .segmented-control__text:not(.segmented-control__item--text) {
    color: #fff !important;
  }
}
</style>
