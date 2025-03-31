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
            <CustomTag title="筛选" @click="onSwitchFilterPage">
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
          <TagCard
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
    setGameStyleFilter();
  }
}

const filterParams = reactive<IFilterParams>({
  filter: { wow_game_style: [], wow_jobs: [] },
  lastId: -1,
  lastUpdatedAt: '',
});
async function setGameStyleFilter() {
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
    default:
      output = [];
      break;
  }
  filterParams.filter.wow_game_style = output;

  // 重置分页参数
  filterParams.lastId = -1;
  filterParams.lastUpdatedAt = '';

  vListRef.value?.reload?.();
}
async function onFilterOptionChange(params) {
  filterParams.filter = params;
  filterParams.lastId = -1;
  filterParams.lastUpdatedAt = '';
  currentFeature.value = 'all';
  vListRef.value?.reload?.();
}
//#endregion

//#region 加载
let cardList: ITagCardItem[] = [];
const cardCount = ref<number>();
//#endregion

//#region 过滤页面
const showFilterPage = ref(false);
const filterOptions = ref();
function onSwitchFilterPage() {
  showFilterPage.value = !showFilterPage.value;
}
//#endregion

//#region 虚拟列表
const virtualList = ref();

function virtualListChange(vList) {
  virtualList.value = vList;
}
async function queryList(pageNo: number, pageSize: number, from: string) {
  console.log(pageNo, pageSize, from);

  if (['load-more'].includes(from) && cardList.length) {
    const lastTagCard = cardList.slice(-1)[0];
    filterParams.lastId = lastTagCard.id;
    filterParams.lastUpdatedAt = lastTagCard.updated_at;
  } else if (['user-pull-down'].includes(from)) {
    filterParams.lastId = -1;
    filterParams.lastUpdatedAt = '';
  }
  const { data, total } = await queryUserTagByFilter(filterParams);
  cardCount.value = total;
  if (['load-more'].includes(from)) {
    cardList.push(...data);
  } else {
    uni.showToast({
      title: `获取了${total}张铭牌`,
      icon: 'none',
    });
    cardList = data;
  }

  vListRef.value?.completeByTotal(data, total);
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
