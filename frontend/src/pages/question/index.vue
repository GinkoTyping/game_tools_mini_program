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
          isTrash(questionList?.[currentIndex].guide_type)
            ? 'trash-image'
            : 'boss-image',
        ]"
        :src="questionList?.[currentIndex].imageSrc"
        :mode="
          isTrash(questionList?.[currentIndex].guide_type)
            ? 'heightFix'
            : 'widthFix'
        "
        @load="onImageLoad"
        v-show="isImageLoaded"
      />
    </view>

    <!-- 问题标题 -->
    <view class="question-title">
      <rich-text
        :nodes="
          renderTip(
            questionList?.[currentIndex].question_text.text ?? '',
            '16px',
            '18px'
          )
        "
      ></rich-text>
    </view>

    <!-- 选项列表 -->
    <uni-list>
      <uni-list-item
        v-for="(option, index) in questionList?.[currentIndex].question_text
          .options"
        :key="index"
        clickable
        @click="selectOption(option.value)"
      >
        <template v-slot:header>
          <view class="slot-header">
            <text>{{ optionMark(index) }}.</text>
          </view>
        </template>
        <template v-slot:body>
          <view class="slot-body">
            <text>{{ option.text }}</text>
          </view>
        </template>
        <template v-slot:footer>
          <view class="slot-footer">
            <uni-icons
              :type="
                selectedIndex === option.value ? 'checkbox-filled' : 'close'
              "
              color="#007aff"
              size="30"
            ></uni-icons>
          </view>
        </template>
      </uni-list-item>
    </uni-list>

    <!-- 控制按钮 -->
    <view class="question-button">
      <view class="question-button-item" @click="prevQuestion">上一题</view>
      <view
        class="question-button-item question-button-item--active"
        @click="nextQuestion"
        >下一题</view
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

const questionList = ref<IQuestionItem[]>();
onLoad(async () => {
  questionList.value = await queryQuestions({ dungeonId: 500 });
});

const currentIndex = ref(0);
const stepCount = computed(() => currentIndex.value + 1);
const selectedIndex = ref(-1);
const selectOption = index => {
  selectedIndex.value = index;
};
const prevQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    selectedIndex.value = -1; // 重置选择
  }
};
const nextQuestion = () => {
  if (
    questionList.value?.length &&
    currentIndex.value < questionList.value.length - 1
  ) {
    currentIndex.value++;
    selectedIndex.value = -1; // 重置选择
  }
};

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

// 图片加载优化
const isImageLoaded = ref(false);
function onImageLoad(e) {
  console.log(e);

  isImageLoaded.value = true;
}
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
  margin-right: 16rpx;
  color: $uni-text-color-inverse;
}
.slot-body {
  flex: 1;
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
</style>
