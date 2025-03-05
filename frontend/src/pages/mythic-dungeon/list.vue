<template>
  <uni-list>
    <uni-list-item
      v-for="dungeon in dungeonList"
      :key="dungeon.name_zh"
      showArrow
      rightText="查看"
    >
      <template v-slot:header>
        <view class="slot-header">
          <image
            class="slot-image"
            src="https://render.worldofwarcraft.com/us/zones/operation-floodgate-small.jpg"
            mode="heightFix"
          ></image>
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
    </uni-list-item>
  </uni-list>
</template>

<script lang="ts" setup>
import { queryMythicDunegonList } from '@/api/wow';
import { onLoad } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';

const dungeonList = ref();

onLoad(async () => {
  dungeonList.value = await queryMythicDunegonList();
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
.slot-header {
  display: flex;
  align-items: center;
  margin-right: 4px;
  .slot-image {
    object-fit: cover;
    height: 80px;
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
