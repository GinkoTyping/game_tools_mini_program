<template>
  <uni-title
    type="h1"
    :title="scoreDisplay.title"
    color="#007aff"
    align="center"
  ></uni-title>
  <view class="score-container animate__animated animate__fadeIn">
    <view class="score-desc">{{ scoreDisplay.desc }}</view>
    <uni-title
      type="h2"
      :title="`正确率：${correctRate}%(${diffCorrect}平均)`"
      :color="scoreDisplay.color"
      align="center"
    >
      <view class="score-avg">平均： {{ avgCorrect }}%</view>
    </uni-title>

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
      :title="wrongList?.length ? '错题汇总' : '没有任何错题'"
      color="#007aff"
      align="center"
    />

    <uni-list>
      <uni-list-item
        class="animate__animated animate__fadeInUp"
        v-for="(item, index) in wrongList"
        :key="item.id"
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
              <view>答案：{{ getAnswer(item) }}</view>
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

  <view class="question-button">
    <view
      class="question-button-item"
      @click="() => navigator.toQuestionIndex()"
      >再做一题</view
    >
    <button
      open-type="share"
      class="question-button-item question-button-item--active"
    >
      <text>分享</text>
    </button>
  </view>

  <ad-custom
    unit-id="adunit-115759c2a1546b5e"
    style="margin-top: 36rpx"
  ></ad-custom>

  <view class="footer"></view>

  <ShareIcon />
</template>

<script lang="ts" setup>
import { IQuestionItem, queryQuestions } from '@/api/wow';
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';
import { computed, reactive, ref } from 'vue';
import { renderTip } from '@/hooks/richTextGenerator';
import { useNavigator } from '@/hooks/navigator';
import ShareIcon from '@/components/ShareIcon.vue';

onShareAppMessage(() => ({
  title: '冲层如渡劫，题库是攻略！',
  path: 'pages/question/index',
}));

//#region 数据
const questionList = ref<IQuestionItem[]>([]);
const wrongList = computed(() =>
  questionList.value.filter(item => item.isRight === 0)
);
const getAnswer = computed(
  () => (item: IQuestionItem) =>
    item.question_text.options.find(
      option => option.value === item.question_text.answer.value
    )?.text
);
const dungeon = reactive({ id: -1, name: '' });
const avgCorrect = ref(0);
const diffCorrect = computed(() => {
  const diff = Number(correctRate.value) - avgCorrect.value;
  const absDiff = Math.abs(diff).toFixed(2);
  if (diff === 0) {
    return `恰好`;
  }
  return diff ? `↑${absDiff}%` : `↓${absDiff}%`;
});
onLoad(async options => {
  dungeon.id = options?.dungeonId ?? 500;
  const responseData = await queryQuestions({
    dungeonId: dungeon.id,
    showAvgCorrect: true,
  });
  dungeon.name = responseData.dungeonName;
  avgCorrect.value = Number(responseData.avgCorrect);
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
      title: '🏆大秘境仙人',
      desc: [
        `你知道'麦卡贡'跳怪路线⏳，却永远算不准队友的'ADD半径' —— 这就是人生✔️。`,
        `你是'8门全开'的移动攻略库🔑，'残暴周'的人形DBM🔥！`,
        `你的大脑堪比'大秘境'地图全开🔥，连'伤逝剧场'的巡逻怪都为你写日记🏆。`,
      ],
    },
    medium: {
      title: '🗝️钥匙征服者·漏勺型',
      desc: [
        `你成功通关🔑'集合石生存指南'第一章！但请停止在'强韧周'问：'这BOSS不是上周才砍过吗🌿？'`,
        `你是队伍里的'战术指挥'(背锅担当)🛡️，总能在灭团瞬间喊出：'我的我的！'——虽然内心OS是：'这帮菜狗带不动啊！🔮'`,
        `你的战斗复盘比战斗日志还详细⭐，但每次灭团后总结永远是那句——'网络卡了，真的🔮！`,
      ],
    },
    low: {
      title: '🌿是萌新?! 我们有救了',
      desc: [
        `恭喜！❄️你成功避开了所有正确答案，解锁成就：【灭团发动机】☠️！下次请对治疗说：'我站火里是因为冷。'`,
        `你的知识储备堪比'血色修道院'的小怪💀 —— 只会无脑冲锋！但别慌，每个大佬都曾是那个在'幽暗城'迷路三小时的萌新🏆`,
        `建议下次答题前先嗑一瓶🧪'智力合剂'（什么，你不知道拍卖行在哪⚠️）`,
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

  .score-desc {
    font-size: 32rpx;
  }

  .score-avg {
    font-size: 26rpx;
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
  margin-bottom: 10px;
  height: 40px;
  box-sizing: border-box;

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
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }

  .question-button-item--active {
    background-color: $uni-color-primary;
  }
}

.footer {
  height: 140rpx;
}
</style>
