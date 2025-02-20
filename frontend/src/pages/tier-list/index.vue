<template>
  <uni-collapse ref="collapse">
    <uni-collapse-item
      v-for="(item, index) in tierList?.tier_data"
      :key="item.tier"
      :open="index <= 2"
    >
      <template v-slot:title>
        <view class="collapse-title">
          <text class="collapse-title__tier">{{ item.tier }}</text>
          <text class="collapse-title__tier--suffix">级</text>
        </view>
      </template>
      <view class="collapse-content">
        <view
          :class="[spec.roleClass, 'collapse-content__card']"
          v-for="spec in item.children"
          :key="spec.fullNameEN"
          @click="() => onClickSpec(spec)"
          :style="{
            backgroundImage: `url(${getClassIconURL(
              spec.roleClass,
              spec.classSpec
            )})`,
          }"
        >
          <image
            v-if="spec.dataChange !== '-'"
            class="collapse-content__card__change"
            :src="`/static/icon/${spec.dataChange}.png`"
          />
        </view>
      </view>
    </uni-collapse-item>
  </uni-collapse>

  <uni-popup class="pupup-container" ref="detailPopup">
    <image
      :class="[currentSpec?.roleClass ? currentSpec.roleClass : '']"
      v-if="currentSpec?.roleClass"
      :src="getClassIconURL(currentSpec.roleClass, currentSpec.classSpec)"
    />
    <uni-card class="desc-card">
      <view :class="['desc-card__title', currentSpec?.roleClass]">{{
        currentSpec?.fullNameZH
      }}</view>
      <rich-text :nodes="renderTip(currentSpec?.descZH)"></rich-text>
    </uni-card>
    <SpellCard
      class="spell-card"
      v-for="spell in currentSpells"
      :key="spell.id"
      :spell="spell"
    />
  </uni-popup>
</template>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app';
import { queryTierList } from '@/api/wow/index';
import { ref } from 'vue';

import SpellCard from '@/components/SpellCard.vue';
import { getClassIconURL } from '@/hooks/imageGenerator';
import { renderTip } from '@/hooks/richTextGenerator';
import {
  ITierListDTO,
  ITierSpecDetail,
  querySpellsInTip,
} from '@/api/wow/index';

const tierList = ref<ITierListDTO>();
const currentSpec = ref();
const currentSpells = ref();
onLoad(async () => {
  tierList.value = await queryTierList({
    versionId: '11.1.0 - PTR',
    activityType: 'MYTHIC',
    role: 'DPS',
  });
});

const detailPopup = ref();
async function onClickSpec(spec: ITierSpecDetail) {
  currentSpec.value = spec;
  currentSpells.value = await querySpellsInTip(
    spec.spells.map(spell => spell.spellId)
  );
  detailPopup.value?.open?.();
}
</script>

<style lang="scss" scoped>
// TODO 和 index/index 页面的样式有冗余
::v-deep uni-collapse-item {
  &:nth-child(1) {
    background-color: $color-s-tier !important;
  }
  &:nth-child(2) {
    background-color: $color-a-tier !important;
  }
  &:nth-child(3) {
    background-color: $color-b-tier !important;
  }
  &:nth-child(4) {
    background-color: $color-c-tier !important;
  }
  &:nth-child(5) {
    background-color: $color-d-tier !important;
  }
  .uni-collapse-item__title.uni-collapse-item-border {
    line-height: 40px;
    border-bottom: 4px solid $uni-bg-color-grey;
    padding-left: 32px;
    box-sizing: border-box;
    font-size: 16px;
    .uni-collapse-item--animation text {
      color: $uni-bg-color-grey !important;
    }
  }
  .uni-collapse-item__wrap {
    background-color: $uni-bg-color-grey !important;
    .uni-collapse-item__wrap-content {
      border: none !important;
    }
  }
}

.collapse-title {
  color: $uni-bg-color;
  font-family: Impact, Haettenschweiler;
  display: flex;
  align-items: baseline;
  .collapse-title__tier {
    width: 20px;
    font-size: large;
    margin-right: 0.2rem;
    display: block;
  }
}
$card-right-margin: 0.4rem;
$card-width: calc((100vw - 4rem - (4 * $card-right-margin)) / 5);
.collapse-content {
  display: flex;
  flex-wrap: wrap;
  margin: 0 1rem;
  padding: 0.4rem 0;
  .collapse-content__card {
    margin-right: $card-right-margin;
    width: $card-width;
    height: $card-width;
    border-radius: 50%;
    background-repeat: no-repeat;
    background-size: cover;
    border-width: 0.2rem;
    border-style: solid;
    margin-bottom: 0.4rem;
    position: relative;
    &:nth-child(5),
    &:nth-child(10) {
      margin-right: 0;
    }

    .collapse-content__card__change {
      width: 1rem;
      height: 1rem;
      position: absolute;
      top: 0;
      right: -0.4rem;
    }
  }
}

::v-deep uni-card {
  .uni-card {
    width: 96vw;
    box-sizing: border-box;
    padding: 0 !important;
    margin: 0 auto !important;
    border: none !important;
    background-color: $uni-bg-color-grey-light !important;
  }
}

::v-deep .uni-popup__wrapper {
  display: flex !important;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.uni-popup__wrapper {
  position: relative;
  image {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -80%);
    width: $card-width;
    height: $card-width;
    border-radius: 50%;
    border-width: 0.2rem;
    border-style: solid;
    z-index: 99;
  }
}
.desc-card {
  .desc-card__title {
    padding-top: 0.5rem;
    text-align: center;
    font-size: large;
    font-weight: bold;
  }
}
.spell-card {
  margin-top: 0.2rem;
}
</style>
