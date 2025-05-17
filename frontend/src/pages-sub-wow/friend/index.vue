<template>
  <view class="page-container">
    <z-paging
      ref="vListRef"
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
          <template #right>
            <CustomTag
              title="筛选"
              @click="onSwitchFilterPage"
              :type="isDetailFiltering ? 'active' : ''"
            >
              <template v-slot:suffix>
                <view>↓</view>
              </template>
            </CustomTag>
          </template>
        </FilterHeader>
      </template>

      <view class="card-list">
        <view
          :id="`zp-id-${item.zp_index}`"
          :key="item.zp_index"
          v-for="(item, index) in virtualList"
          class="card-item"
        >
          <ad-custom
            v-if="item.isAd"
            unit-id="adunit-3e881d1ef7f4ed0f"
            @load="() => onAdLoad(item.zp_index)"
          ></ad-custom>
          <TagCard
            v-if="!item.isAd"
            :data="item"
            v-model:type="item.type"
            @cell-update="() => handleCellUpdate(item.zp_index)"
          />
        </view>
      </view>

      <template #bottom>
        <FriendFooter />
      </template>
    </z-paging>

    <view class="filter-page" v-show="showFilterPage">
      <FilterPage
        v-model:data="filterOptions"
        v-model:show="showFilterPage"
        @change="onFilterOptionChange"
      />
    </view>
  </view>
  <CustomToast ref="toastRef" />
</template>

<script lang="ts" setup>
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';
import { nextTick, reactive, ref } from 'vue';

import {
  type IFilterParams,
  type ITagCardItem,
  queryUserTagByFilter,
  queryUserTagFilterOptions,
} from '@/api/wow';
import TagCard from '@/pages-sub-wow/components/TagCard.vue';
import FilterHeader from '@/pages-sub-wow/components/FilterHeader.vue';
import FriendFooter from '@/pages-sub-wow/components/FriendFooter.vue';
import FilterPage from '@/pages-sub-wow/components/FilterPage.vue';
import CustomTag from '@/components/CustomTag.vue';
import CustomToast from '@/components/CustomToast.vue';

onShareAppMessage(() => ({
  title: '标签即名片，相逢即战友',
  path: `pages/frind/index`,
}));

//#region 过滤栏
const currentFeature = ref('all');
const featureFilters = ref([
  {
    title: '最新',
    value: 'all',
  },
  {
    title: '公开',
    value: 'public',
  },
  {
    title: 'MDI观光',
    value: 'mdi',
    highlight: true,
  },
  {
    title: '大秘境',
    value: 'mythic',
  },
  {
    title: '团本',
    value: 'raid',
  },
  {
    title: '地下堡',
    value: 'delves',
  },
]);

function switchFeature(value: string) {
  isDetailFiltering.value = false;
  setGameStyleFilter();
}

const filterParams = reactive<IFilterParams>({
  filter: {
    wow_game_style: [],
    wow_jobs: [],
    wow_privacy_need_confirm: [],
    common_status: [],
  },
  lastId: -1,
  lastUpdatedAt: '',
  pageSize: 10,
});

async function setGameStyleFilter() {
  // 重置参数
  filterParams.filter = {
    wow_game_style: [],
    wow_jobs: [],
    wow_privacy_need_confirm: [],
    common_status: [],
  };
  filterParams.lastId = -1;
  filterParams.lastUpdatedAt = '';

  let output: any = [];
  switch (currentFeature.value) {
    case 'all':
      output = [];
      break;
    case 'mythic':
    case 'raid':
    case 'delves':
      output = [currentFeature.value];
      break;
    case 'public':
      filterParams.filter.wow_privacy_need_confirm = [0];
      break;
    case 'mdi':
      filterParams.filter.common_status = ['MDI观光'];
      break;
    default:
      output = [];
      break;
  }
  filterParams.filter.wow_game_style = output;

  vListRef.value?.reload?.();
}

//#endregion

//#region 过滤页面
const showFilterPage = ref(false);
const filterOptions = ref();
const isDetailFiltering = ref(false);

function onSwitchFilterPage() {
  showFilterPage.value = !showFilterPage.value;
}

async function onFilterOptionChange(params) {
  filterParams.filter = params;
  filterParams.lastId = -1;
  filterParams.lastUpdatedAt = '';
  currentFeature.value = '';
  isDetailFiltering.value = true;
  vListRef.value?.reload?.();
}

//#endregion

//#region 广告控制 TODO: 后端控制广告数量，监控广告数量
const MAX_AD_COUNT = 5;
const adState = reactive({
  lastAdTimestamp: 0,
  todayAdCount: 0,
  minInterval: 20 * 1000,
});

function isInsertAd(from) {
  // 初始化展示广告的概率降低
  if (
    ['user-pull-down', 'init', 'reload'].includes(from) &&
    Math.random() < 0.3
  ) {
    return true;
  }

  const frequencyCondition =
    Date.now() - adState.lastAdTimestamp > adState.minInterval && // 时间间隔
    adState.todayAdCount < MAX_AD_COUNT;

  return frequencyCondition && Math.random() < getDynamicProbability();
}

function getDynamicProbability() {
  if (adState.todayAdCount <= 3) return 0.8; // 前3次高概率
  if (adState.todayAdCount <= 6) return 0.5;
  return 0.3; // 后续降频
}

function updateAdState() {
  adState.lastAdTimestamp = Date.now();
  adState.todayAdCount++;
}

function createAdItem() {
  return {
    isAd: true,
    id: Date.now(),
  } as ITagCardItem;
}

function onAdLoad(index: number) {
  updateAdState();
  handleCellUpdate(index);
}

//#endregion

//#region 虚拟列表
const vListRef = ref();
let cardList: ITagCardItem[] = [];
const cardCount = ref<number>();
const virtualList = ref();

function virtualListChange(vList) {
  virtualList.value = vList;
}

const toastRef = ref();

async function queryList(pageNo: number, pageSize: number, from: string) {
  if (['load-more'].includes(from) && cardList.length) {
    const lastTagCard = cardList.slice(-1)[0];
    filterParams.lastId = lastTagCard.id;
    filterParams.lastUpdatedAt = lastTagCard.updated_at;
  } else if (['user-pull-down'].includes(from)) {
    filterParams.lastId = -1;
    filterParams.lastUpdatedAt = '';
  }

  // 根据是否有广告，动态修改请求的pageSize
  const hasAd = isInsertAd(from);
  filterParams.pageSize = hasAd ? 9 : 10;

  const { data, total } = await queryUserTagByFilter(filterParams);
  cardCount.value = total;
  if (['load-more'].includes(from)) {
    cardList.push(...data);
  } else {
    toastRef.value.showToast(`获取了${total}张名片`);
    cardList = [...data];
  }

  // 根据是否有广告,在原数据中插入广告
  if (hasAd && data.length > 5) {
    data.splice(5, 0, createAdItem());
  }

  vListRef.value?.complete(data);
}

function handleCellUpdate(index: number) {
  // 为了确保在触发didUpdateVirtualListCell时虚拟列表的高度缓存已就绪
  nextTick(() => {
    vListRef.value?.updateVirtualListCell?.(index);
  });
}

//#endregion

onLoad(async () => {
  filterOptions.value = await queryUserTagFilterOptions();
});
</script>

<style lang="scss" scoped>
.page-container {
  padding-bottom: 150rpx;
  position: relative;
}

// 过滤页面
$filter-main-color: #262629;

.filter-page {
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
}

// 主页面
$header-bg-color: #1d1d1f;

.header-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  z-index: 9;
  top: 0;
  padding: 20rpx;
  width: 100vw;
  box-sizing: border-box;
  color: #bbb;
  background-color: $header-bg-color;

  .left-feature {
    font-size: 24rpx;

    .feature-label {
      margin-right: 24rpx;
    }

    .feature-label--active {
      color: #fff;
      font-size: 26rpx;
    }
  }

  .right-drop-down {
    display: flex;
    align-items: center;
  }
}

::v-deep .right-drop-down {
  .tag-button {
    margin-left: 12rpx;
  }
}

.card-list {
  padding: 20rpx;
  padding-top: 0;

  .card-item {
    padding-bottom: 36rpx;
  }
}

::v-deep .z-paging-content {
  .zp-scroll-view-container {
    top: 100rpx;
    height: calc(100% - 100rpx - 140rpx);
  }
}
</style>
