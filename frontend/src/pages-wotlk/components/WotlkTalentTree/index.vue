<script setup lang="ts">

import type { WotlkSelectedTalent, WotlkTalent } from '@/api/wow-wotlk';
import { computed, ref } from 'vue';
import SpellCard from '@/components/SpellCard.vue';
import { querySpellsInTip } from '@/api/wow';

const props = defineProps({
  data: {
    type: Array<WotlkTalent>,
    default() {
      return [];
    },
  },
  selected: {
    type: Array<WotlkSelectedTalent>,
    default() {
      return [];
    },
  },
  roleClass: {
    type: String,
    default: '',
  },
});

const getTalentStatus = computed(() => {
  return (node: WotlkTalent, index) => {
    if (node) {
      const selected = props.selected.find(item => item.index === index);
      return {
        selected: selected !== undefined,
        points: `${selected?.points}/${selected?.maxPoints}`,
        halfSelected: selected?.points !== selected?.maxPoints,
        spell: node.ranks[(selected?.points ?? 1) - 1],
      };
    }
    return {
      selected: false,
      halfSelected: false,
      points: '',
      spell: -1,
    };
  };
});

// region 查看天赋点
const talentPopup = ref();
const selectedNode = ref();

async function selectTalentNode(id) {
  const data = await querySpellsInTip([id], 'wotlk');
  selectedNode.value = data?.[0];
  if (selectedNode.value) {
    talentPopup.value?.open();
  }
}

// endregion
</script>

<template>
  <view class="talent-tree">
    <view class="talent-node"
      :class="[
        item ? '' : 'talent-node-none',
       getTalentStatus(item, index).selected ? 'talent-node-selected' : '']"
      v-for="(item, index) in props.data"
      :key="index"
      @click="() => selectTalentNode(getTalentStatus(item, index).spell)"
    >
      <view class="talent-node__bg"
        :style="{
        backgroundImage: `url(https://ginkolearn.cyou/api/wow/assets/wotlk-talent/${roleClass}.jpg)`,
        backgroundPosition: `calc(-80rpx * ${item?.index}`
         }"></view>
      <view class="talent-node__points"
        :class="[getTalentStatus(item, index).halfSelected ? 'talent-node__points--half-selected' : '']"
        v-show="getTalentStatus(item, index).selected">
        {{ getTalentStatus(item, index).points }}
      </view>
    </view>
  </view>
  <uni-popup ref="talentPopup">
    <SpellCard :spell="selectedNode" />
  </uni-popup>
</template>

<style scoped lang="scss">
//$node-size: calc((100vw - 40rpx * 2) / 5.5);
$node-size: 80rpx;
.talent-tree {
  display: flex;
  flex-wrap: wrap;
  width: calc($node-size * 4.9);
  gap: calc($node-size * 0.3);
  margin: 0 auto;

  .talent-node {
    width: $node-size;
    aspect-ratio: 1/1;
    border-radius: 12rpx;
    position: relative;
    box-sizing: border-box;

    .talent-node__bg {
      position: absolute;
      left: 0;
      top: 0;
      width: $node-size;
      height: $node-size;
      background-size: auto 100%;
      filter: grayscale(1);
      z-index: -1;
    }

    .talent-node__points {
      position: absolute;
      right: 0;
      bottom: 0;
      transform: translate(30%, 50%);
      padding: 4rpx 6rpx;
      border-radius: 6rpx;
      color: $uni-text-color-inverse;
      background-color: black;
      font-size: 24rpx;
    }

    .talent-node__points--half-selected {
      color: $color-uncommon;
    }
  }

  .talent-node-none {
    .talent-node__bg {
      display: none;
    }
  }

  .talent-node-selected {
    border-color: $uni-text-color-inverse;
    border-width: 2rpx;
    border-style: solid;

    .talent-node__bg {
      filter: none;
      left: -2rpx;
      top: -2rpx;
    }
  }
}
</style>
