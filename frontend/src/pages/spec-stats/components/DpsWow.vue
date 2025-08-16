<template>

  <z-paging
    class="dps-wow-table"
    ref="pagingRef"
    use-virtual-list
    v-model="dataList"
    @query="queryList"
    :default-page-size="50"
    :auto="false"
  >
    <template #top>
      <view class="top-placeholder"></view>
      <view class="row row-thead">
        <view class="row-td--rank">排名</view>
        <view class="row-td--dps-label">DPS</view>
        <view class="row-td--dps">
          <text>角色</text>
          <view class="row-td--dps__filter" @click="handleOpenFilterSelection">
            <uni-tag
              :text="filterParams.rankType === 1 ? '单体' : 'AOE'"
              type="primary"
              size="mini"
              circle />
            <uni-tag
              :text="getDisplayClassTag(filterParams.className)"
              type="primary"
              size="mini"
              circle />
            <uni-tag
              :text="getDisplaySpecTag(filterParams.spec, filterParams.className)"
              type="primary"
              size="mini"
              circle />
            <uni-icons type="settings-filled"
              size="26"
              color="#007aff"
              style="height: 56rpx; width: 56rpx;"></uni-icons>
          </view>
        </view>
      </view>
    </template>

    <view class="row row-tbody" v-for="(item) in dataList" :key="item.key">
      <view class="row-td row-td--rank" :style="getTextStyleByRank(item)">{{ item.rank }}</view>
      <view class="row-td row-td--dps-label">{{ (item.dps / 1000000).toFixed(2) }}M</view>
      <view class="row-td row-td--dps">
        <view :class="[`${item.className}-bg`, 'row-td--dps__info']" :style="{
          width: Math.min(item.dps / maxDps * 100, 100).toFixed(2) + '%'
        }">
          <image :src="getClassIconURL(item.className, item.spec)"></image>
          <view class="row-td--dps__name">{{ item.characterName }}
            <text style="font-size: 20rpx">{{ item.rank <= 10 ? ` (${item.itemLevel})` : '' }}</text>
          </view>
        </view>
      </view>
    </view>

    <template #bottom>
      <view class="table-footer" @click="navigator.toWowDps">
        <view class="table-footer__left">
          <view class="table-footer__info">
            <view>感谢</view>
            <view class="dpswow-label">魔兽DPS</view>
            <image
              src="https://ginkolearn.cyou/api/common/assets/media/dpswow.png"
            ></image>
            <view>提供的数据支持</view>
          </view>
          <view class="table-footer__icon">
            前往小程序获取您的输出模拟数据
          </view>
        </view>
        <view class="table-footer__right">
          <image
            src="https://ginkolearn.cyou/api/common/assets/media/dpswow.png"
          ></image>
        </view>
      </view>
    </template>

  </z-paging>

  <uni-popup ref="popupRef" type="bottom" @change="handleTogglePopup">
    <view class="dps-wow-select" type="bottom">
      <view class="dps-wow-select__header">
        <view>请选择过滤条件</view>
        <view class="submit-button" @click="handleClickSubmit">确定</view>
      </view>
      <view class="spec-list">
        <view class="spec-list__label">分类：</view>
        <uni-data-checkbox v-model="filterParams.rankType" :localdata="filterSelections.rankType"></uni-data-checkbox>
      </view>
      <view class="spec-list">
        <view class="spec-list__label">职业：</view>
        <CustomTag
          v-for="item in filterSelections.specOptions"
          :key="item.key"
          :title="item.value"
          :wow-class="item.key"
          :type="filterParams.className === item.key ? 'spec-reverse' : 'spec'"
          @click="handleClickClass(item, 'className')"
        />
      </view>
      <view class="spec-list" v-if="filterParams.className">
        <view class="spec-list__label">专精：</view>
        <CustomTag
          v-for="item in activeSpecOptions"
          :key="item.key"
          :title="item.value as any"
          :wow-class="filterParams.className"
          :type="filterParams.spec === item.key ? 'spec-reverse' : 'spec'"
          @click="handleClickClass(item, 'spec')"
        />
      </view>
    </view>
  </uni-popup>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';

import { queryDpsWowList } from '@/api/wow/dpswow';
import { getClassIconURL } from '@/hooks/imageGenerator';
import locales from '@/data/zh-latest.json';
import CustomTag from '@/components/CustomTag.vue';
import { useNavigator } from '@/hooks/navigator';

const navigator = useNavigator();

// region 虚拟表格
const pagingRef = ref<any>(null);
const dataList = ref<any[]>([]);
const maxDps = ref(1);
const getTextStyleByRank = computed(() => {
  return row => {
    const rank = row.rank;
    if (rank <= 5) {
      return {
        color: '#d32121',
        fontWeight: 'bold',
      };
    }
    if (rank <= 20) {
      return {
        color: '#e37e00',
      };
    }
    if (rank <= 100) {
      return {
        color: '#f3d037',
      };
    }
    return {};
  };
});

async function queryList(pageNo: number, pageSize: number, from: string) {
  const { list, pagination } = (await queryDpsWowList({
    page: pageNo,
    size: pageSize,
    ...filterParams,
  }) as any);

  if (from !== 'load-more') {
    maxDps.value = list?.[0].dps;
  }
  pagingRef.value?.completeByTotal(list, pagination?.total);
}

// endregion

// region 参数选择
const popupRef = ref<any>();
const filterSelections = {
  rankType: [
    {
      text: '单体',
      value: 1,
    },
    {
      text: 'AOE',
      value: 2,
    },
  ],
  specOptions: buildClassSpecSelections(),
};

const filterParams = reactive<any>({
  rankType: 1,
  className: undefined,
  spec: undefined,
});

function buildClassSpecSelections() {
  return Object.entries(locales.class).map(([key, value]) => ({
    key,
    value,
    children: Object.entries(locales[key]).map(([specKey, specValue]) => ({
      key: specKey,
      value: specValue,
    })),
  }));
}


function handleOpenFilterSelection() {
  popupRef.value?.open();
}

function handleClickClass(item, prop) {
  if (filterParams[prop] === item.key) {
    filterParams[prop] = undefined;
  } else {
    filterParams[prop] = item.key;
  }

  if (prop === 'className') {
    filterParams.spec = undefined;
  }
}

const activeSpecOptions = computed(() => {
  return filterSelections.specOptions.find(item => item.key === filterParams.className)?.children;
});

function handleClickSubmit() {
  popupRef.value?.close();
}

function handleTogglePopup({ show }) {
  if (!show) {
    pagingRef.value?.reload();
  }
}

const getDisplayClassTag = computed(() => {
  return (classKey: string) => {
    if (!classKey) {
      return '全部职业';
    }
    if (classKey.includes('death')) {
      return '死亡骑士';
    }
    if (classKey.includes('demon')) {
      return '恶魔猎手';
    }
    return locales.class[classKey];
  };
});

const getDisplaySpecTag = computed(() => {
  return (spec: string, className: string) => {
    if (!spec) {
      return '全部专精';
    }
    const formattedSpec = spec.replaceAll('_', '-');
    return locales[className][formattedSpec];
  };
});
// endregion

defineExpose({
  initPage() {
    pagingRef.value?.reload();
  },
});
</script>

<style scoped lang="scss">
@use '@/static/css/mixins.scss' as *;

$row-height: 48rpx;

.top-placeholder {
  padding-top: 120rpx;
}

.row {
  display: flex;
  color: #fff;
  font-size: 24rpx;
  line-height: $row-height;
  height: $row-height;
  gap: 4rpx;

  .row-td--rank {
    width: 80rpx;
    text-align: center;
  }

  .row-td--character-name {
    line-height: 30rpx;
    width: 220rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;

    view {
      @include multi-line-ellipsis(1);
    }

    image {
      width: $row-height;
      height: $row-height;
    }
  }

  .row-td--item-level {
    width: 60rpx;
  }

  .row-td--dps-label {
    width: 86rpx;
  }

  .row-td--dps {
    flex: 1;
  }
}

.row-tbody {
  padding-bottom: 1rpx;

  .row-td--dps-label {
    color: $uni-text-color-inverse;
  }

  .row-td--dps {
    margin-right: 20rpx;
    background-color: $uni-bg-color-grey-lighter;

    .row-td--dps__info {
      display: flex;
      align-items: center;
      gap: 8rpx;
    }

    .row-td--dps__name {
      padding-left: 4rpx;
      color: $uni-bg-color;
      letter-spacing: 1rpx;
    }

    image {
      width: $row-height;
      height: $row-height;
    }
  }
}

.row-thead {
  color: $uni-text-color-grey;
  padding-bottom: 10rpx;
  height: 56rpx;
  line-height: 56rpx;

  .row-td--dps {
    display: flex;
    padding-right: 20rpx;
    justify-content: space-between;

    .row-td--dps__filter {
      display: flex;
      align-items: center;
      gap: 6rpx;
    }
  }
}

.dps-wow-select {
  position: fixed;
  width: 100vw;
  bottom: 0;
  left: 0;
  z-index: 1000;
  padding: 20rpx 20rpx 180rpx 20rpx;
  box-sizing: border-box;
  background-color: $uni-bg-color-grey-light;
  display: flex;
  flex-direction: column;
  gap: 20rpx;

  .spec-list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10rpx;

    .spec-list__label {
      color: #bbb;
      font-size: 28rpx;
    }
  }

  .dps-wow-select__header {
    display: flex;
    justify-content: space-between;
    font-size: 30rpx;
    color: #fff;

    .submit-button {
      background-color: $uni-color-primary;
      padding: 4rpx 12rpx;
      border-radius: 8rpx;
    }
  }
}

.table-footer {
  height: 150rpx;
  padding: 0 20rpx;
  font-size: 30rpx;
  color: $uni-text-color-grey;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1rpx solid $uni-bg-color-grey-lighter;

  .table-footer__info {
    display: flex;
    align-items: center;

    .dpswow-label {
      color: $uni-text-color-inverse;
      margin-left: 8rpx;
      font-weight: bold;
    }

    image {
      width: 40rpx;
      height: 40rpx;
      margin-left: 4rpx;
      margin-right: 8rpx;
    }
  }


  .table-footer__right {
    width: 70rpx;
    display: flex;
    justify-content: center;
    align-items: center;

    image {
      width: 70rpx;
      height: 70rpx;
    }
  }
}
</style>
