<template>
  <ad-custom class="ad" unit-id="adunit-9b8c383168ec41f3" style=""></ad-custom>
  <view class="container">
    <ProgressBar :total="questionList?.length" v-model:current="stepCount" />

    <!-- 顶部图片 -->
    <view class="image-container">
      <view
        class="question-image question-image_placeholder"
        v-if="!isImageLoaded"
      >
        <view class="animate__animated animate__rotateOut animate__infinite">
          <uni-icons
            type="reload"
            color="rgb(255, 209, 0)"
            size="50"
          ></uni-icons>
        </view>
        <view>图片加载中...</view>
      </view>
      <image
        class="question-image"
        :class="[
          isTrash(currentQuestion?.guide_type) ? 'trash-image' : 'boss-image',
        ]"
        :src="currentQuestion?.imageSrc"
        :mode="isTrash(currentQuestion?.guide_type) ? 'heightFix' : 'widthFix'"
        @load="onImageLoad"
        v-show="isImageLoaded"
      />
    </view>

    <!-- 问题标题 -->
    <view class="question-title">
      <rich-text
        :nodes="
          renderTip(currentQuestion?.question_text.text ?? '', '16px', '18px')
        "
      ></rich-text>
    </view>

    <!-- 选项列表 -->
    <uni-list :class="[isShowReason ? 'show-reason' : '']">
      <uni-list-item
        v-for="(option, index) in currentQuestion?.question_text.options"
        :key="index"
        clickable
        @click="selectOption(option.value)"
        :class="[isAnswerOption(index) && isShowReason ? 'slot-answer' : '']"
      >
        <template v-slot:header>
          <view class="slot-header">
            <text>{{ optionMark(index) }}.</text>
          </view>
        </template>
        <template v-slot:body>
          <view class="slot-body">
            <text class="slot-body-option">{{ option.text }}</text>
            <rich-text
              class="slot-body-reason"
              v-show="isAnswerOption(index) && isShowReason"
              :nodes="
                renderTip(
                  `解析：${currentQuestion?.question_text.answer.text ?? ''}`,
                  '14px',
                  '14px'
                )
              "
            ></rich-text>
          </view>
        </template>
        <template v-slot:footer>
          <view class="slot-footer">
            <uni-icons
              :type="optionBtnIcon(option.value)"
              :color="optionBtnColor(option.value)"
              size="30"
            ></uni-icons>
          </view>
        </template>
      </uni-list-item>
    </uni-list>

    <!-- 控制按钮 -->
    <view class="question-button">
      <view
        class="question-button-item"
        :class="[currentIndex === 0 ? 'disabled-button' : '']"
        @click="prevQuestion"
        >上一题</view
      >
      <view
        class="question-button-item question-button-item--active"
        :class="[
          currentIndex === questionList?.length ? 'disabled-button' : '',
        ]"
        @click="nextQuestion"
        >{{ isShowReason ? '学到了, ' : '' }}下一题</view
      >
    </view>
  </view>
</template>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';

import { IQuestionItem, queryQuestions } from '@/api/wow';
import { renderTip } from '@/hooks/richTextGenerator';
import ProgressBar from '@/components/ProgressBar.vue';

//#region 界面文本
const isTrash = computed(() => (type: string | undefined) => type === 'trash');
const optionMark = computed(() => (index: number) => {
  switch (index) {
    case 0:
      return 'A';
    case 1:
      return 'B';
    default:
      return 'C';
  }
});
const optionBtnColor = computed(() => (index: number) => {
  if (isShowReason.value) {
    return validateAnswer(index) ? 'rgb(29, 245, 1)' : '#d32121';
  }
  return '#007aff';
});
const optionBtnIcon = computed(() => (index: number) => {
  if (isShowReason.value) {
    if (validateAnswer(index)) {
      return 'checkbox-filled';
    }
    return selectedIndex.value === index ? 'clear' : 'close';
  }
  return selectedIndex.value === index ? 'checkbox-filled' : 'close';
});
//#endregion

//#region 初始化数据
const currentIndex = ref(0);
const currentQuestion = ref<IQuestionItem>();
const questionList = ref<IQuestionItem[]>();
onLoad(async () => {
  questionList.value = await queryQuestions({ dungeonId: 500 });
  currentIndex.value = 0;
  currentQuestion.value = questionList.value?.[0];
});
//#endregion

//#region 按钮
const stepCount = computed(() => currentIndex.value + 1);
const selectedIndex = ref(-1);
const selectOption = index => {
  if (selectedIndex.value !== index && !isShowReason.value) {
    selectedIndex.value = index;
  }
};

function validateAnswer(index: number) {
  return index === currentQuestion.value?.question_text.answer.value;
}
const isAnswerOption = computed(() => (index: number) => validateAnswer(index));
const isShowReason = ref(false);
function switchPage(isNext) {
  isNext ? currentIndex.value++ : currentIndex.value--;

  currentQuestion.value = questionList.value?.[currentIndex.value];

  // 检查是不是已经做过的问题
  if (currentQuestion.value) {
    if (currentQuestion.value.lastSelectedIndex === -1) {
      selectedIndex.value = -1;
      isShowReason.value = false;
    } else {
      selectedIndex.value = currentQuestion.value.lastSelectedIndex;
      isShowReason.value = true;
    }
  }
}
const nextQuestion = () => {
  if (
    questionList.value?.length &&
    currentIndex.value < questionList.value.length - 1
  ) {
    if (selectedIndex.value === -1 && !isShowReason.value) {
      uni.showToast({ title: '请点击一个选项', icon: 'error' });
    } else {
      const isRight = validateAnswer(selectedIndex.value);
      if (!isShowReason.value && currentQuestion.value) {
        currentQuestion.value.isRight = isRight ? 1 : 0;
        currentQuestion.value.lastSelectedIndex = selectedIndex.value;
      }

      if (isRight || isShowReason.value) {
        switchPage(true);
      } else {
        isShowReason.value = true;
      }
    }
  } else {
    console.log(
      '错误',
      questionList.value
        ?.filter(item => item.isRight === 0)
        .map(item => item.id)
    );
  }
};
const prevQuestion = () => {
  if (currentIndex.value > 0) {
    switchPage(false);
  }
};
//#endregion

//#region 图片加载优化
const isImageLoaded = ref(false);
function onImageLoad() {
  isImageLoaded.value = true;
}
//#endregion
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  margin-top: 130px;
}
// 广告
.ad {
  top: 0;
  width: 100vw;
  margin-bottom: 1rem;
  position: absolute;
}

// 图片
.image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  .question-image_placeholder {
    width: 96vw;
    height: 18vh;
    background-color: $uni-bg-color-grey-lighter;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: $uni-text-color-inverse;
  }
  .question-image {
    margin: 20rpx auto;
    border-radius: 40rpx;
  }
  .trash-image {
    height: 18vh;
  }
  .boss-image {
    width: 96vw !important;
  }
}

.question-title {
  margin-bottom: 30rpx;
  padding: 0 15px;
}
// 选项
::v-deep .uni-list {
  .uni-list--border-top {
    height: 2px;
    background-color: $uni-color-primary;
  }
  .uni-list--border-bottom {
    height: 2px;
    background-color: $uni-bg-color-grey;
  }
  .uni-list-item {
    background-color: $uni-bg-color-grey-lighter !important;
    .uni-list-item__container {
      padding-top: 8px;
      padding-bottom: 8px;
    }
  }
}
.slot-body,
.slot-header,
.slot-footer {
  display: flex;
  align-items: center;
  color: #fff;
}
.slot-header {
  font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  padding-right: 16rpx;
  width: 30rpx;
  color: $uni-text-color-inverse;
}
.show-reason {
  .slot-header {
    color: #bbb;
  }
  .slot-body {
    color: #bbb;
  }
  .uni-icons {
    color: #bbb !important;
  }
  .slot-answer {
    .slot-body {
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      .slot-body-option {
        padding-left: 44rpx;
        font-weight: bold;
        color: $color-uncommon;
        margin-bottom: 10rpx;
      }
    }
    .slot-header {
      position: absolute;
      color: $color-uncommon;
      flex-direction: column;
      justify-content: flex-start;
    }
  }
  .slot-error {
    .slot-body {
      // color: $color-s-tier
    }
  }
}
.slot-body {
  flex: 1;
  padding-right: 10rpx;
}
.slot-footer {
  justify-content: flex-end;
}

// 底部按钮
.question-button {
  display: flex;
  justify-content: space-between;
  border: 1px solid $uni-color-primary;
  position: relative;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  overflow: hidden;
  background-color: $uni-bg-color-grey-lighter;
  color: #fff;
  margin-bottom: 10px;
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    height: 100%;
    width: 2px;
    background-color: $uni-color-primary;
  }
  .question-button-item {
    width: 50%;
    height: 100%;
    font-size: 14px;
    font-weight: bold;
    text-align: center;
    padding: 10px 0;
  }
  .question-button-item--active {
    background-color: $uni-color-primary;
  }
}
.disabled-button {
  color: #bbb;
  background-color: $uni-bg-color-grey-light;
}
</style>
