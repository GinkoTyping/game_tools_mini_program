<template>
  <uni-notice-bar
    v-show="isShowNotice"
    show-icon
    text="点击攻略文本，可查看技能详细描述"
  />
  <uni-collapse>
    <uni-collapse-item
      :open="bossIndex === 0"
      v-for="(boss, bossIndex) in raidData"
      :key="boss.title_key"
    >
      <template v-slot:title>
        <view>
          <text class="menu-index">{{ bossIndex + 1 }}号</text>
          <text class="menu-title">{{ boss.title }}</text>
        </view>
      </template>
      <view class="boss-image">
        <img
          :src="`https://ginkolearn.cyou/api/wow/assets/raid-guide/${boss.title_key}.jpg`"
          mode="heightFix"
          style="height: 22vh"
        />
      </view>
      <view v-for="tipKind in boss.children[0].children" :key="tipKind.title">
        <uni-title
          type="h4"
          :title="tipKind.title"
          align="center"
          color="#007aff"
        ></uni-title>
        <view
          class="tip-text"
          v-for="(tip, tipIndex) in tipKind.children"
          :key="tipIndex"
          @click="() => showSpells(tip.spells)"
        >
          <rich-text v-if="tip.text" :nodes="renderTip(tip.text)"></rich-text>
        </view>
      </view>
    </uni-collapse-item>
  </uni-collapse>

  <ad-custom
    unit-id="adunit-d7122c0e58cd2bbe"
    bindload="adLoad"
    binderror="adError"
    bindclose="adClose"
  ></ad-custom>

  <uni-popup ref="spellPopup">
    <SpellCard :spell="spell" v-for="spell in currentSpells" :key="spell.id" />
  </uni-popup>

  <ShareIcon />
</template>

<script lang="ts" setup>
import { queryRaidGuide, querySpellsInTip } from '@/api/wow';
import { renderTip } from '@/hooks/richTextGenerator';
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';
import { ref } from 'vue';

import SpellCard from '@/components/SpellCard.vue';
import ShareIcon from '@/components/ShareIcon.vue';

const raidData = ref();
const isShowNotice = ref(true);
onLoad(async () => {
  raidData.value = await queryRaidGuide();
});
onShareAppMessage(() => ({
  title: '解放安德麦 一句话攻略',
  path: `pages-sub-wow/raid-guide/index`,
}));

const currentSpells = ref();
const spellPopup = ref();

async function showSpells(spells: any) {
  if (spells?.length) {
    isShowNotice.value = false;

    currentSpells.value = await querySpellsInTip(
      spells.map((spell: any) => spell.id),
    );
    if (currentSpells.value.filter((item: any) => item !== null).length) {
      spellPopup.value?.open?.();
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep .uni-collapse {
  background-color: $uni-bg-color-grey-light !important;

  .uni-collapse-item__title-box {
    background-color: $uni-bg-color-grey-light !important;
  }
}

::v-deep uni-collapse-item {
  width: 100vw;

  .uni-collapse-item__title.uni-collapse-item-border {
    line-height: 40px;
    border-bottom: 4px solid $uni-bg-color-grey;
    padding-left: 18px;
    box-sizing: border-box;
    font-size: 16px;
  }

  .uni-collapse-item__wrap {
    background-color: $uni-bg-color-grey !important;

    .uni-collapse-item__wrap-content {
      border: none !important;
      padding: 0.4rem 0;
      background-color: rgb(43, 44, 44) !important;
    }
  }
}

.menu-title {
  color: $color-b-tier;
  font-size: 14px;
  font-weight: bold;
}

.menu-index {
  color: #fff;
  font-size: 14px;
}

.boss-image {
  display: flex;
  justify-content: center;
}

.tip-text {
  padding: 0 1.8rem;
  margin-bottom: 4px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #fff;
    left: 1.2rem;
    top: 10px;
    transform: translateY(-50%);
  }
}
</style>
