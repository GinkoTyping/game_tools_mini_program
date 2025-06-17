<script setup lang="ts">

import { computed, ref } from 'vue';

const props = defineProps({
  classKey: String,
  data: Object,
});

const displayRotationAssistIndex = ref(0);
const displayRotationAssistData = computed(() => {
  return props.data?.data?.[displayRotationAssistIndex.value];
});
const segmentedList = computed(() => {
  return props.data?.data?.map(item => item.label);
});

function switchRotationAssistTable(e) {
  if (displayRotationAssistIndex.value != e.currentIndex) {
    displayRotationAssistIndex.value = e.currentIndex;
  }
}

</script>

<template>
  <uni-section class="bis" :class="[props.classKey]" title="官方战斗辅助功能">
    <uni-card class="section-card">
      <view class="rotation-assist-summary">
        11.1.17 版本新增战斗辅助功能，包括2种类型： <br />
        <uni-tooltip placement="right">
          <template #content>
            <view style="width: 300rpx">
              <view class="summary-detail">
                启用“辅助标亮”后，系统会根据角色当前状态及资源，
                <text>自动提示</text>
                下个推荐技能。该选项能为
                <text>输出循环</text>
                提供协助，适用于所有专精，便于新玩家或尝试新专精的玩家上手，亦可提供技能指导。
              </view>
            </view>
          </template>
          <text>
            <text class="iconfont icon-question-circle-fill"></text>
            辅助标亮
          </text>
        </uni-tooltip>
        和
        <uni-tooltip placement="right">
          <template #content>
            <view style="width: 300rpx">
              <view class="summary-detail">
                启用“一键辅助”后，
                <text>按一次键</text>
                即可施放下个伤害输出技能。此功能主要为需要帮助或想轻松体验游戏的玩家设计，但使用时会
                <text>略微延长</text>
                公共冷却时间（GCD）。系统还会智能判断何时在游戏世界中施放范围法术。
              </view>
            </view>
          </template>
          <text>
            <text class="iconfont icon-question-circle-fill"></text>
            一键辅助
          </text>
        </uni-tooltip>
        。该功能可帮助熟悉新职业，但也会导致DPS降低(参考下表)。
      </view>

      <uni-segmented-control
        v-show="segmentedList.length > 1"
        :class="[props.classKey]"
        :current="displayRotationAssistIndex"
        :values="segmentedList"
        style-type="text"
        @clickItem="switchRotationAssistTable"
      />

      <view class="table-wrap">
        <uni-table class="rotation-assist-table" stripe emptyText="暂无更多数据">
          <uni-tr>
            <uni-th width="42" align="center" v-for="column in displayRotationAssistData.columns" :key="column">
              {{ column }}
            </uni-th>
          </uni-tr>
          <uni-tr v-for="(row, index) in displayRotationAssistData.rows" :key="index">
            <uni-td v-for="(value, valueIdx) in row" :key="valueIdx">
              <view class="rotation-assist-table-td">{{ value }}</view>
            </uni-td>
          </uni-tr>
        </uni-table>
      </view>

      <view class="rotation-assist-summary" v-show="props.data?.info">
        {{ props.data?.info }}
      </view>
    </uni-card>

  </uni-section>
</template>

<style scoped lang="scss">
.summary-detail {
  text {
    color: $uni-text-color-inverse;
  }
}

.rotation-assist-summary {
  font-size: 28rpx;
  color: $uni-text-color-grey;

  text {
    color: $uni-text-color-inverse;
  }

  .iconfont {
    font-size: 28rpx;
  }
}

.table-wrap {
  padding: 10rpx 0;
}

.rotation-assist-table-td {
  text-align: center;
  color: $uni-text-color-grey !important;
}
</style>
