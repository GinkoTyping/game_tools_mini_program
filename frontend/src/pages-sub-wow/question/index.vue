<template>
  <!-- <view class="rank-menu">
    <view
      class="rank-menu-item"
      :class="[currentMenu === 'question' ? 'rank-menu-item--active' : '']"
      @click="() => switchMenu('question')"
      >题卷</view
    >
    <view
      class="rank-menu-item"
      :class="[currentMenu === 'popular' ? 'rank-menu-item--active' : '']"
      @click="() => switchMenu('popular')"
      >我的收藏</view
    >
  </view> -->
  <uni-notice-bar
    single
    show-icon
    color="#2979FF"
    background-color="#EAF2FF"
    text="点击结果页面'/reload'📜可重新挑战！"
  />

  <view class="container">
    <FilterMenu v-model:data="questionSort" @change="switchMenu" />
    <view class="dungeon-list">
      <view
        class="dungeon-list-item"
        :class="[getCompletionTextClass(dungeon)]"
        v-for="dungeon in dungeons"
        :key="dungeon.id"
        @click="() => toQuestionPage(dungeon)"
      >
        <image
          class="image"
          :src="`https://ginkolearn.cyou/api/wow/assets/dungeon/${dungeon.id}.webp`"
          mode="widthFix"
        ></image>
        <view class="info">
          <view class="name">{{ dungeon.name }}</view>
          <view class="completion"
          >
            <text class="completion-prefix"
            >{{ dungeon.doneQuestionCount }}/{{
                dungeon.totalQuestionCount
              }}
            </text
            >
            <text class="completion-suffix">题</text>
          </view
          >
          <view class="access">
            <uni-icons type="eye-filled" color="#fff" size="20"></uni-icons>
            <view class="access-num">{{ dungeon.count }}</view>
          </view>
          <view class="avg">
            <view>平均正确率：</view>
            <view class="avg-num">{{ dungeon.avgCorrect }}%</view>
          </view>
        </view>
      </view>
    </view>
  </view>
  <ad-custom
    unit-id="adunit-fb4c9d3de4009085"
    style="margin-top: 20rpx"
  ></ad-custom>
  <view class="footer"></view>
  <ShareIcon />
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { onShareAppMessage, onShow } from '@dcloudio/uni-app';

import { type IQuestionDungeon, queryQuestionDungeons } from '@/api/wow';
import { useNavigator } from '@/hooks/navigator';
import ShareIcon from '@/components/ShareIcon.vue';
import FilterMenu from '@/components/FilterMenu.vue';

onShareAppMessage(() => ({
  title: '冲层如渡劫，题库是攻略！',
  path: 'pages/question/index',
}));

const navigator = useNavigator();
const dungeons = ref<IQuestionDungeon[]>();
onShow(async () => {
  dungeons.value = await queryQuestionDungeons();
  sortDungeon();
});

const questionSort = ref({
  title: '排序',
  list: [
    {
      label: '热度排序',
      value: 'popularity',
    },
    {
      label: '正确率',
      value: 'correct',
    },
  ],
});

function sortDungeon() {
  if (currentMenu.value === 'popularity') {
    dungeons.value = dungeons.value?.sort((a, b) => b.count - a.count);
  } else {
    dungeons.value = dungeons.value?.sort(
      (a, b) => Number(a.avgCorrect) - Number(b.avgCorrect),
    );
  }
}

const currentMenu = ref('popularity');

function switchMenu(name: string) {
  if (currentMenu.value !== name) {
    currentMenu.value = name;
    sortDungeon();
  }
}

function toQuestionPage(dungeon: IQuestionDungeon) {
  if (dungeon.doneQuestionCount < dungeon.totalQuestionCount) {
    navigator.toQuestionDungeon(dungeon.id);
  } else {
    navigator.toQuestionResult(dungeon.id);
  }
}

//#region 文本、样式
const getCompletionTextClass = computed(() => (dungeon: IQuestionDungeon) => {
  if (dungeon.doneQuestionCount === 0) {
    return 'zero-completion';
  }
  if (dungeon.doneQuestionCount < dungeon.totalQuestionCount) {
    return 'half-completion';
  }
  return 'done-completion';
});

//#endregion
</script>

<style lang="scss" scoped>
$list-item-width: 47vw;

.container {
  padding: 0 2vw;
}

.rank-menu {
  display: flex;
  justify-content: space-between;
  border: 1px solid $uni-color-primary;
  position: relative;
  margin: 0 2vw;
  border-radius: 10px;
  overflow: hidden;
  background-color: $uni-bg-color-grey-light;
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

  .rank-menu-item {
    width: 50%;
    height: 100%;
    font-size: 14px;
    font-weight: bold;
    text-align: center;
    padding: 10px 0;
  }

  .rank-menu-item--active {
    background-color: $uni-color-primary;
  }
}

.dungeon-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  .dungeon-list-item {
    position: relative;
    margin-bottom: calc(100vw - 4vw - $list-item-width * 2);
    box-sizing: border-box;

    image {
      border-radius: 20rpx;
      width: $list-item-width;
      position: relative;
    }

    .info {
      position: absolute;
      z-index: 2;

      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .name {
        color: $uni-text-color-inverse;
        font-size: 18px;
        font-weight: bold;
      }

      .completion {
        color: #fff;
        font-size: 16px;
        font-weight: bolder;
        margin-top: 10rpx;
        margin-bottom: 10rpx;
        display: flex;
        align-items: center;

        .completion-suffix {
          font-size: 12px;
          margin-left: 8rpx;
          font-weight: normal;
        }
      }

      .access,
      .avg {
        color: #fff;
        display: flex;
        align-items: center;

        .access-num {
          font-size: 30rpx;
          font-weight: bold;
          margin-left: 6rpx;
        }
      }

      .avg {
        font-size: 20rpx;
        color: $uni-text-color-inverse;

        .avg-num {
          font-weight: bold;
          text-decoration: underline;
        }
      }
    }
  }

  .zero-completion {
    .completion-prefix {
      color: $uni-color-error;
    }
  }

  .half-completion {
    .completion-prefix {
      color: $color-legend;
    }
  }

  .done-completion {
    .completion-prefix {
      color: $color-uncommon;
    }
  }

  .zero-completion,
  .half-completion {
    image {
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgb(0 0 0 / 40%);
        z-index: 1;
      }
    }
  }
}

.footer {
  height: 140rpx;
}
</style>
