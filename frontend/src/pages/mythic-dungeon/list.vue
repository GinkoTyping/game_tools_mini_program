<template>
  <uni-list>
    <template v-for="(dungeon, index) in dungeonList" :key="dungeon.name_zh">
      <ad-custom
        v-if="dungeon.isAd"
        unit-id="adunit-5496b0b56b3b44c6"
      ></ad-custom>
      <uni-list-item
        v-else
        showArrow
        rightText="查看"
        clickable
        @click="() => navigator.toMythicDungeon(dungeon.id)"
      >
        <template v-slot:header>
          <view class="slot-header">
            <image
              class="slot-image"
              :src="`https://ginkolearn.cyou/api/wow/assets/dungeon/${dungeon.id}.webp`"
              mode="heightFix"
            ></image>
            <view class="slot-header__tier">
              <text
                class="slot-header__tier-main"
                :class="[`tier-${dungeon.tier?.toLowerCase()}`]"
                >{{ dungeon.tier }}</text
              >
              <text class="slot-header__tier-sub"
                >({{ dungeon.tierText }})</text
              >
            </view>
          </view>
        </template>
        <template v-slot:body>
          <view class="slot-body">
            <view class="slot-body__header">{{ dungeon.name_zh }}</view>
            <view
              class="slot-body__desc"
              v-for="rating in dungeon.ratings"
              :key="rating.label"
            >
              <view class="slot-body__desc-label">{{ rating.label }}</view>
              <text :class="[scoreConfig(rating.score).class, 'score']">{{
                rating.score
              }}</text>
              <image :src="scoreConfig(rating.score).src" />
            </view>
          </view>
        </template>
        <template v-slot:footer>
          <view class="slot-footer">
            <uni-icons type="eye" color="#fff" size="20"></uni-icons>
            <view>{{ dungeon.count }}</view>
          </view>
        </template>
      </uni-list-item>
    </template>
  </uni-list>

  <view class="footer"></view>

  <ShareIcon />
</template>

<script lang="ts" setup>
import { queryMythicDunegonList } from '@/api/wow';
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';

import { useNavigator } from '@/hooks/navigator';
import ShareIcon from '@/components/ShareIcon.vue';

const dungeonList = ref();
const navigator = useNavigator();

onLoad(async () => {
  dungeonList.value = await queryMythicDunegonList();
  dungeonList.value.splice(4, 0, { isAd: true, name_zh: 'ad' });
});

onShareAppMessage(() => {
  return {
    title: '大秘境攻略',
    path: 'pages/mythic-dungeon/list',
  };
});

const scoreConfig = computed(() => {
  return (score: number) => {
    if (score >= 4) {
      return {
        class: 'hard',
        src: '/static/icon/skeleton_red.svg',
      };
    }
    if (score >= 2) {
      return {
        class: 'medium',
        src: '/static/icon/skeleton_yellow.svg',
      };
    }
    return {
      class: 'easy',
      src: '/static/icon/skeleton_green.svg',
    };
  };
});
</script>
<style lang="scss" scoped>
.footer {
  height: 5rem;
  width: 1vw;
}
.slot-header {
  display: flex;
  align-items: center;
  margin-right: 4px;
  position: relative;
  .slot-image {
    object-fit: cover;
    max-width: 140px;
    height: 80px;
  }
  .slot-header__tier {
    position: absolute;
    bottom: 4px;
    left: 4px;
    font-size: 12px;
    height: 20px;
    padding: 0 8px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    color: #fff;
    background-color: #999;
    .slot-header__tier-main {
      font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
      font-weight: bold;
      font-size: 16px;
      margin-right: 4px;
    }
  }
  .tier-s {
    color: $color-c-tier;
  }
  .tier-a {
    color: $color-b-tier;
  }
  .tier-b {
    color: $color-a-tier;
  }
  .tier-c {
    color: $color-s-tier;
  }
}

.slot-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .slot-body__header {
    color: #fff;
    font-size: 14px;
    font-weight: bold;
  }
  .slot-body__desc {
    font-size: 12px;
    display: flex;
    align-items: center;
    .slot-body__desc-label {
      width: 64px;
      color: #999;
    }
    .score {
      font-weight: bold;
      margin-right: 4px;
    }
    image {
      width: 14px;
      height: 14px;
      margin-right: 6px;
    }
    .hard {
      color: $color-s-tier;
    }
    .medium {
      color: $color-legend;
    }
    .easy {
      color: $color-c-tier;
    }
  }
}

.slot-footer {
  color: #bbb;
  display: flex;
  align-items: center;
  font-size: 12px;
}

::v-deep .uni-list {
  .uni-list--border-top,
  .uni-list--border-bottom {
    background-color: $uni-bg-color-grey !important;
  }
  .uni-list-item {
    background-color: rgb(43, 44, 44) !important;
    .uni-list-item__content-title {
      color: #fff;
    }
    .uni-list-item__container {
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
