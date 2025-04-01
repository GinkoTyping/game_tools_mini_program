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
        <view class="header-filter">
          <view class="left-feature">
            <text
              v-for="feature in featureFilters"
              :key="feature.value"
              class="feature-label"
              :class="[
                currentFeature === feature.value
                  ? ' feature-label--active'
                  : '',
              ]"
              @click="() => switchFeature(feature.value)"
              >{{ feature.title }}</text
            >
          </view>
          <view class="right-drop-down">
            <CustomTag
              title="筛选"
              @click="onSwitchFilterPage"
              :type="isDetailFiltering ? 'active' : ''"
            >
              <template v-slot:suffix>
                <view>↓</view>
              </template>
            </CustomTag>
          </view>
        </view>
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
            @load="() => handleCellUpdate(item.zp_index)"
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
</template>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app';
import { reactive, ref } from 'vue';

import {
  IFilterParams,
  ITagCardItem,
  queryUserTagByFilter,
  queryUserTagFilterOptions,
} from '@/api/wow';
import TagCard from '@/components/TagCard.vue';
import CustomTag from '@/components/CustomTag.vue';
import FriendFooter from '@/components/FriendFooter.vue';
import FilterPage from '@/components/FilterPage.vue';

const vListRef = ref();

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
  if (currentFeature.value !== value) {
    currentFeature.value = value;
    isDetailFiltering.value = false;
    setGameStyleFilter();
  }
}

const filterParams = reactive<IFilterParams>({
  filter: { wow_game_style: [], wow_jobs: [], wow_privacy_need_confirm: [] },
  lastId: -1,
  lastUpdatedAt: '',
  pageSize: 10,
});
async function setGameStyleFilter() {
  // 重置参数
  filterParams.filter.wow_privacy_need_confirm = [];
  filterParams.filter.wow_game_style = [];
  filterParams.lastId = -1;
  filterParams.lastUpdatedAt = '';

  let output;
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
  currentFeature.value = 'all';
  isDetailFiltering.value = true;
  vListRef.value?.reload?.();
}
//#endregion

//#region 虚拟列表
let cardList: ITagCardItem[] = [];
const cardCount = ref<number>();
const virtualList = ref();

function virtualListChange(vList) {
  virtualList.value = vList;
}
function isInsertAd(from) {
  if (['user-pull-down', 'init', 'reload'].includes(from)) {
    return true;
  }

  if (from === 'load-more' && Math.random() < 0.5) {
    return true;
  }
  return false;
}
function createAdItem() {
  return {
    isAd: true,
    id: Date.now(),
  } as ITagCardItem;
}
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
    uni.showToast({
      title: `获取了${total}张名片`,
      icon: 'none',
    });
    cardList = data;
  }

  // 根据是否有广告,在原数据中插入广告
  if (hasAd) {
    data.splice(5, 0, createAdItem());
  }

  vListRef.value?.complete(data);
}
function handleCellUpdate(index: number) {
  vListRef.value?.didUpdateVirtualListCell?.(index);
}
//#endregion

onLoad(async () => {
  vListRef.value?.reload?.();
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
