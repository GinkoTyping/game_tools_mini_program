<script setup lang="ts">
import { computed, ref } from 'vue';
import { useNavigator } from '@/hooks/navigator';
import locales from '@/data/zh.json';

const props = defineProps({
  specKey: String,
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

// region 跳转
const selectedSpec = ref();
const navigator = useNavigator();
const alertDialog = ref();
const dialogContent = ref();

function handleClickSpec(item) {
  selectedSpec.value = item;
  dialogContent.value = `查看 ${locales[item.roleClass][item.classSpec]} ${locales.class[item.roleClass]} 的攻略?`;
  alertDialog.value?.open?.();
}

function dialogConfirm() {
  navigator.toSpecDetail(selectedSpec.value.roleClass, selectedSpec.value.classSpec, 'rotation', '.rotation-assist');
}

function dialogClose() {
  alertDialog.value?.close?.();
}

// endregion

</script>

<template>
  <uni-section class="rotation-assist" :class="[props.classKey]" title="官方战斗辅助功能">
    <view class="rotation-assist-content">
      <uni-card class="section-card">
        <view class="rotation-assist-summary">
          11.1.7 版本新增战斗辅助功能，包括2种类型： <br />
          <uni-tooltip placement="right">
            <template #content>
              <view style="width: 500rpx">
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
          <uni-tooltip placement="bottom">
            <template #content>
              <view style="width: 400rpx">
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
                <view class="rotation-assist-table-th">{{ column }}</view>
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

      <uni-card class="section-card">
        <view class="rotation-assist-summary">
          以下排名为使用
          <text>辅助标亮</text>
          且玩家需要
          <text>自助控制</text>
          爆发技能的数据
        </view>
        <view class="rotation-assist-rank-wrap">
          <view class="rotation-assist-rank-row" v-for="row in props.data?.rank" :key="row.title">
            <view class="rotation-assist-rank-row-tier"
              :class="[`rotation-assist-rank-row-tier--${row.title.toLowerCase()}`]">
              <view class="rotation-assist-rank-row-tier__title">{{ row.title }}</view>
              <view class="rotation-assist-rank-row-tier__sub-title">{{ row.subTitle }}</view>
            </view>
            <image class="rotation-assist-rank-row-item"
              @click="() => handleClickSpec(item)"
              :class="{ 'rotation-assist-rank-row-item--active': item.roleClass === props.classKey && item.classSpec === props.specKey }"
              v-for="(item, index) in row.children"
              :key="index"
              :src="`https://ginkolearn.cyou/api/wow/assets/class-icons/${item.roleClass}-${item.classSpec}-class-icon.webp`"></image>
          </view>
        </view>
      </uni-card>
    </view>
  </uni-section>

  <uni-popup ref="alertDialog" type="dialog">
    <uni-popup-dialog
      type="info"
      cancelText="等会儿"
      confirmText="可以"
      title="提示"
      :content="dialogContent"
      @confirm="dialogConfirm"
      @close="dialogClose"
    ></uni-popup-dialog>
  </uni-popup>
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

.rotation-assist-table-td,
.rotation-assist-table-th {
  font-size: 28rpx;
}

.rotation-assist-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}


// region 战斗辅助 排名
.rotation-assist-rank-wrap {
  margin-top: 10rpx;
}

.rotation-assist-rank-row {
  display: flex;
  flex-wrap: wrap;
  padding-left: 80rpx;
  position: relative;
  margin-bottom: 6rpx;

  .rotation-assist-rank-row-tier {
    font-size: 24rpx;
    line-height: 24rpx;
    width: 80rpx;
    height: 100%;
    display: flex;
    flex-direction: column;
    text-align: center;
    justify-content: center;
    gap: 10rpx;
    color: #fff;
    position: absolute;
    left: 0;
    top: 0;
    border-bottom-left-radius: 10rpx;
    border-top-left-radius: 10rpx;

    .rotation-assist-rank-row-tier__title {
      font-size: 28rpx;
      font-weight: bold;
    }
  }

  .rotation-assist-rank-row-tier--s {
    background-color: $color-s-tier;
  }

  .rotation-assist-rank-row-tier--a {
    background-color: $color-a-tier;
  }

  .rotation-assist-rank-row-tier--b {
    background-color: $color-b-tier;
  }

  .rotation-assist-rank-row-item {
    height: 80rpx;
    width: 80rpx;
    border-radius: 10rpx;
    filter: grayscale(.8);
    box-sizing: border-box;
  }

  .rotation-assist-rank-row-item--active {
    filter: grayscale(0);
    position: relative;

    &::after {
      position: absolute;
      content: '';
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      border: 4rpx solid $uni-text-color-inverse;
    }
  }
}

// endregion
</style>
