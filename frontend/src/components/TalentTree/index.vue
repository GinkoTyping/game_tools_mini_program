<script setup lang="ts">
import type { TalentNode } from '@/api/wow';
import activeBorder from '@/static/images/wow/talent/spell.svg';
import passiveBorder from '@/static/images/wow/talent/passive.svg';
import choiceBorder from '@/static/images/wow/talent/choice.svg';
import { computed } from 'vue';

const data = defineModel('modelValue', {
  type: Array<TalentNode>, default() {
    return [];
  },
});

const TREE_PADDING = '0rpx';
const COL_WIDTH = `calc((100vw - ${TREE_PADDING} * 2) / 10)`;
const CONTAINER_HEIGHT = `calc((100vw - ${TREE_PADDING} * 2) / 10 * 15)`;
const getPosition = computed(() => {
  return (item: TalentNode) => {
    const offsetX = `calc((${item.display_col} - 1) * ${COL_WIDTH} * 1.5)`;
    const offsetY = `calc((${item.display_row} - 2) * ${COL_WIDTH} * 1.5)`;
    return `translate(${offsetX}, ${offsetY})`;
  };
});
const getBorder = computed(() => {
  return (item: TalentNode) => {
    switch (item.node_type.type) {
      case 'ACTIVE':
        return activeBorder;
      case 'PASSIVE':
        return passiveBorder;
      case 'CHOICE':
        return choiceBorder;
      default:
        return activeBorder;
    }
  };
});
</script>

<template>
  <view class="tree-container" :style="{ height: CONTAINER_HEIGHT }">
    <view class="node-item"
      v-for="node in data"
      :key="node.id"
      :style="{ transform: getPosition(node), width: COL_WIDTH }">
      <image class="border-bg" :src="getBorder(node)"></image>
    </view>
  </view>
</template>

<style scoped lang="scss">
$col-width: calc(100% / 10);
.tree-container {
  position: relative;

  .node-item {
    position: absolute;
    aspect-ratio: 1/1;
    left: 0;
    top: 0;

    image {
      width: 100%;
      height: 100%;
    }

    .border-bg {
      filter: grayscale(1);
    }

    .border-bg--active {
      filter: none;
    }
  }
}

</style>
