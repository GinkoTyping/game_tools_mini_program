<template>
  <uni-title
    type="h2"
    :title="`${dungeon.name} 答题完成`"
    color="#007aff"
    align="center"
  ></uni-title>
  <view class="score-container animate__animated animate__fadeIn">
    <view class="score-text" :class="[scoreTextClass]">{{ correctRate }}%</view>
    <view class="score-label">正确率</view>
    <view class="question-icons">
      <uni-icons
        :color="item.isRight ? 'rgb(29, 245, 1)' : '#d32121'"
        :type="item.isRight ? 'checkbox-filled' : 'clear'"
        size="30"
        v-for="item in questionList"
        :key="item.id"
      ></uni-icons>
    </view>
  </view>

  <view class="question-overview">
    <uni-title
      type="h2"
      title="错题汇总"
      color="#007aff"
      align="center"
    ></uni-title>

    <uni-list>
      <uni-list-item
        class="animate__animated animate__fadeInUp"
        v-for="(item, index) in questionList.filter(item => item.isRight === 0)"
        :key="item.id"
        ellipsis="2"
        :note="item.question_text.answer.text"
        rightText="查看攻略"
        showArrow
      >
        <template v-slot:body>
          <view class="slot-body">
            <rich-text
              class="slot-body-question"
              :nodes="renderTip(item?.question_text.text, '14px', '14px')"
            ></rich-text>
            <view class="slot-body-answer">
              <view
                >答案：{{
                  item?.question_text.options[item.question_text.answer.value]
                    .text
                }}</view
              >
              <rich-text
                :nodes="
                  renderTip(
                    `解析：${item.question_text.answer.text}`,
                    '14px',
                    '14px',
                    '#bbb'
                  )
                "
              ></rich-text>
            </view>
          </view>
        </template>
        <template v-slot:foot>
          <view class="slot-footer"> 查看攻略 </view>
        </template>
      </uni-list-item>
    </uni-list>
  </view>

  <ad-custom
    unit-id="adunit-115759c2a1546b5e"
    style="margin-top: 24rpx"
  ></ad-custom>

  <view class="footer"></view>

  <ShareIcon />
</template>
<script lang="ts" setup>
import { IQuestionItem, queryQuestions } from '@/api/wow';
import { onLoad } from '@dcloudio/uni-app';
import { computed, reactive, ref } from 'vue';
import { renderTip } from '@/hooks/richTextGenerator';
import ShareIcon from '@/components/ShareIcon.vue';

//#region 数据
const questionList = ref<IQuestionItem[]>([]);
const dungeon = reactive({ id: -1, name: '' });
onLoad(async options => {
  dungeon.id = options?.dungeonId ?? 500;
  const responseData = await queryQuestions({ dungeonId: dungeon.id });
  dungeon.name = responseData.dungeonName;
  questionList.value = responseData.data;
});
//#endregion

//#region 文本
const correctRate = computed(() => {
  const correctCount = questionList.value?.filter(item => item.isRight).length;
  if (correctCount && questionList.value?.length) {
    return ((correctCount / questionList.value?.length) * 100).toFixed(1);
  }
  return '计算中';
});
const scoreTextClass = computed(() => {
  if (Number(correctRate.value) > 80) {
    return 'excellent-score';
  }
  if (Number(correctRate.value) > 60) {
    return 'good-score';
  }
  return 'bad-score';
});
//#endregion
</script>
<style scoped lang="scss">
.score-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  .score-text {
    font-size: 60rpx;
    font-weight: bold;
  }
  .score-label {
    font-size: 32rpx;
  }
  .excellent-score {
    color: $color-uncommon;
  }
  .good-score {
    color: $color-a-tier;
  }
  .bad-score {
    color: $uni-color-error;
  }
  .question-icons {
    margin-top: 20rpx;
  }
  .question-overview {
  }
}
::v-deep .uni-list {
  background-color: $uni-bg-color-grey-lighter !important;
  .uni-list--border-top,
  .uni-list--border-bottom {
    background-color: $uni-bg-color-grey !important;
  }
  .uni-list-item {
    background-color: $uni-bg-color-grey-lighter !important;
    .slot-body {
      flex: 1;
      .slot-body-answer {
        margin-top: 20rpx;
        color: $uni-color-success;
        font-size: 14px;
      }
    }
  }
}
.hide {
  display: none;
}
.footer {
  height: 140rpx;
}
</style>
