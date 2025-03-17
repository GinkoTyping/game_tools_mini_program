<template>
  <uni-title
    type="h1"
    :title="scoreDisplay.title"
    color="#007aff"
    align="center"
  ></uni-title>
  <view class="score-container animate__animated animate__fadeIn">
    <view>{{ scoreDisplay.desc }}</view>
    <uni-title
      type="h2"
      :title="`正确率：${correctRate}%`"
      :color="scoreDisplay.color"
      align="center"
    ></uni-title>
    <view class="score-text" :class="[scoreDisplay.color]"> </view>
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
      :title="wrongList?.length ? '错题汇总' : '试试其他大秘境吧'"
      color="#007aff"
      align="center"
    ></uni-title>

    <uni-list>
      <uni-list-item
        class="animate__animated animate__fadeInUp"
        v-for="(item, index) in wrongList"
        :key="item.id"
        ellipsis="2"
        :note="item.question_text.answer.text"
        rightText="查看攻略"
        showArrow
        clickable
        @click="() => toMythicDetailPage(item)"
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
import { useNavigator } from '@/hooks/navigator';

//#region 数据
const questionList = ref<IQuestionItem[]>([]);
const wrongList = computed(() =>
  questionList.value.filter(item => item.isRight === 0)
);
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

function getScoreDisplay(key) {
  const randomScoreText = {
    high: {
      title: '大秘境仙人',
      desc: [
        `你知道'麦卡贡'跳怪路线，却永远算不准队友的'ADD半径' —— 这就是人生。`,
        `你是'8门全开'的移动攻略库，'残暴周'的人形DBM！`,
        `你的大脑堪比'大秘境'地图全开，连'伤逝剧场'的巡逻怪都为你写日记。`,
      ],
    },
    medium: {
      title: '钥匙征服者·漏勺型',
      desc: [
        `“你成功通关'集合石生存指南'第一章！但请停止在'强韧周'问：'这BOSS不是上周才砍过吗？'”`,
        `“你是'8门全开'的移动攻略库，'残暴周'的人形DBM！”`,
        `“你的战斗复盘比战斗日志还详细，但每次灭团后总结永远是那句——'网络卡了，真的！”`,
      ],
    },
    low: {
      title: '是萌新?!我们有救了',
      desc: [
        `“恭喜！你成功避开了所有正确答案，解锁成就：【灭团发动机】！下次请对治疗说：'我站火里是因为冷。”`,
        `“你的知识储备堪比'血色修道院'的小怪 —— 只会无脑冲锋！但别慌，每个大佬都曾是那个在'幽暗城'迷路三小时的萌新。”`,
        `“建议下次答题前先嗑一瓶'智力爆发力'（别告诉我你不知道拍卖行在哪）。”`,
      ],
    },
  };
  const index = Math.floor(Math.random() * 3);
  return {
    title: randomScoreText[key].title,
    desc: randomScoreText[key].desc[index],
  };
}

const scoreDisplay = computed(() => {
  if (Number(correctRate.value) > 80) {
    return { color: 'rgb(29, 245, 1)', ...getScoreDisplay('high') };
  }
  if (Number(correctRate.value) > 60) {
    return { color: '#e37e00', ...getScoreDisplay('medium') };
  }
  return { color: '#dd524d', ...getScoreDisplay('low') };
});
//#endregion
const navigator = useNavigator();
function toMythicDetailPage(item: IQuestionItem) {
  navigator.toMythicDungeon(dungeon.id, item.guide_type, item.guide_id);
}
</script>
<style scoped lang="scss">
.score-container {
  padding: 0 4vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  .score-text {
    font-size: 60rpx;
    font-weight: bold;
    display: flex;
    align-items: flex-end;
    .score-text--suffix {
      font-size: 30rpx;
    }
  }
  .score-label {
    color: #bbb;
    font-size: 26rpx;
  }
  .score-label-tip {
    color: $uni-color-primary;
    font-size: 32rpx;
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
    .uni-list-item__container {
      display: flex;
      align-items: center;
    }
    .slot-body {
      flex: 1;
      .slot-body-answer {
        margin-top: 20rpx;
        color: $uni-color-success;
        font-size: 14px;
      }
    }
    .slot-footer {
      display: flex;
      align-items: center;
      color: #bbb;
      height: 50px;
      line-height: 50px;
      font-size: 14px;
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
