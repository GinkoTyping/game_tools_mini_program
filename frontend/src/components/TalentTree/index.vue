<script setup lang="ts">
import { getSpellImageUrl, type TalentNode, type TalentTreeDTO } from '@/api/wow';
import { computed, getCurrentInstance, ref, watch, type PropType, nextTick } from 'vue';
import { onReady } from '@dcloudio/uni-app';

const props = defineProps({
  type: {
    type: String,
    default: 'class',
  },
  data: {
    type: Object as PropType<TalentTreeDTO>,
    default() {
      return {};
    },
  },
});

const currentTreeData = computed(() => {
  if (props.type === 'spec') {
    return props.data?.spec_talent_nodes?.filter(node => !heroNodeIds.value.includes(node.id));
  }
  if (props.type === 'class') {
    return props.data?.class_talent_nodes;
  }
  console.log(heroTalentTrees.value);
  return heroTalentTrees.value?.[0]?.hero_talent_nodes;
});
const buildIndex = ref(0);
const currentBuild = computed(() => {
  return props.data.talents.talentTreeBuilds[buildIndex.value];
});
const heroTalentTrees = computed(() => {
  return props.data?.hero_talent_trees.filter(tree => tree.playable_specializations.find(spec => spec.id === props.data.id));
});
const heroNodeIds = computed(() => {
  if (props.data) {
    return [...props.data.hero_talent_trees.map(heroTree => heroTree.hero_talent_nodes)].flat().map(
      node => node.id);
  }
  return [];
});
const coordinateConfig = computed(() => {
  if (props.data && currentTreeData.value) {
    const list = [...currentTreeData.value];

    function filterHeroTalentNode(id: number) {
      if (props.type === 'hero') {
        return true;
      }
      return !heroNodeIds.value.includes(id);
    }

    const validNodes = list.filter(node => (node.ranks[0]?.tooltip || node.ranks[0]?.choice_of_tooltips) && filterHeroTalentNode(
      node.id));
    const sortedByCol = [...validNodes].sort((a, b) => b.display_col - a.display_col);
    const sortedByRow = [...validNodes].sort((a, b) => b.display_row - a.display_row);
    const minCol = sortedByCol?.splice(-1)?.[0]?.display_col ?? 0;
    const maxCol = sortedByCol?.[0]?.display_col ?? 0;
    const minRow = sortedByRow?.splice(-1)?.[0]?.display_row ?? 0;
    const maxRow = sortedByRow?.[0]?.display_row ?? 0;
    console.log({
      startRow: minRow,
      rowCount: maxRow - minRow + 1,
      colCount: maxCol - minCol + 1,
      startCol: minCol,
    });
    return {
      startRow: minRow,
      rowCount: maxRow - minRow + 1,
      colCount: maxCol - minCol + 1,
      startCol: minCol,
    };
  }
  return {
    startRow: 1,
    rowCount: 1,
    colCount: 1,
    startCol: 1,
  };
});

const TREE_PADDING = 20;
const windowWidth = ref(0);
const getContainerHeight = computed(() => 1.5 * getNodeSize.value * (coordinateConfig.value.rowCount ?? 1));
const getContainerWidth = computed(() => {
  const width = windowWidth.value - uni.upx2px(TREE_PADDING) * 2;
  return props.type === 'hero' ? uni.upx2px(320) : width;
});
const nodeOffset = computed(() => {
  return {
    x: getNodeSize.value * 1.5,
    y: getNodeSize.value * 1.5,
  };
});

// region node
const getNodeSize = computed(() => {
  const size = getContainerWidth.value / (coordinateConfig.value.colCount * 1.5 - 0.5);
  return Number(size.toFixed(2));
});
const getNodePosition = computed(() => {
  return (item: TalentNode) => {
    const [x, y] = getLinePoint(item.display_row, item.display_col, false);
    return `translate(${x}px, ${y}px)`;
  };
});
const getNodeBorder = computed(() => {
  return (item: TalentNode) => {
    switch (item.node_type.type) {
      case 'ACTIVE':
        return {
          image: 'node-item__bg-spell',
          mask: 'node-item__icon-mask-spell',
        };
      case 'PASSIVE':
        return {
          image: 'node-item__bg-passive',
          mask: 'node-item__icon-mask-passive',
        };
      case 'CHOICE':
        return {
          image: 'node-item__bg-choice',
          mask: 'node-item__icon-mask-choice',
        };
      default:
        return {
          image: 'node-item__bg-spell',
          mask: 'node-item__icon-mask-spell',
        };
    }
  };
});
const getNodeIconBg = computed(() => {
  return (node: TalentNode) => {
    const image = node.ranks?.[0]?.tooltip?.spell_tooltip.spell.image;
    if (image) {
      return getSpellImageUrl(image).item;
    } else if (node.ranks?.[0]?.choice_of_tooltips?.length) {
      return node.ranks?.[0]?.choice_of_tooltips.map(spellItem => getSpellImageUrl(spellItem.spell_tooltip.spell.image).item);
    }
    return '';
  };
});

const getNodeStatus = computed(() => {
  return (nodeId: number) => {
    const found = currentBuild.value.talentTree.build.selectedNodes.find(([id]) => nodeId === id);
    return {
      selected: found !== undefined,
      rank: found?.[1],
    };
  };
});
// endregion

// region edge
const instance = getCurrentInstance();
const canvasId = ref(`canvas_${Date.now()}`);

function getLinePoint(row: number, col: number, isEdge) {
  const extra = isEdge ? 1 / 3 : 0;
  return [
    nodeOffset.value.x * (col - coordinateConfig.value.startCol + extra),
    nodeOffset.value.y * (row - coordinateConfig.value.startRow + extra),
  ];
}

async function drawEdge() {
  const ctx = uni.createCanvasContext(canvasId.value, instance);

  ctx.clearRect(0, 0, getContainerWidth.value, getContainerHeight.value);

  currentTreeData.value.forEach((node) => {
    if (node.unlocks?.length) {
      const beginPoint = getLinePoint(node.display_row, node.display_col, true);
      node.unlocks.forEach((childId) => {
        const childNode = currentTreeData.value.find((item) => item.id === childId);
        if (childNode) {
          const endPoint = getLinePoint(childNode?.display_row, childNode.display_col, true);

          ctx.beginPath();
          ctx.setStrokeStyle('#737373');
          ctx.setLineWidth(2.5);
          ctx.setLineCap('round');

          ctx.moveTo(beginPoint[0], beginPoint[1]);
          ctx.lineTo(endPoint[0], endPoint[1]);

          ctx.stroke();
        }

      });
    }
  });

  await new Promise(resolve => ctx.draw(false, resolve));
}

// endregion

onReady(() => {
  windowWidth.value = uni.getSystemInfoSync().windowWidth;
  drawEdge();
});

watch(() => props.type, () => {
  nextTick(() => {
    drawEdge();
  });
});

</script>

<template>
  <view class="tree-container"
    :class="[`tree-container__id__${canvasId}`]"
    :style="{ height: `${getContainerHeight}px`, width: `${getContainerWidth}px` }">
    <view class="canvas-wrap">
      <canvas
        :canvas-id="canvasId"
        :id="canvasId"
        :style="{ width: `${getContainerWidth}px`, height: `${getContainerHeight}px` }"
      ></canvas>
    </view>
    <view class="node-item"
      v-for="node in currentTreeData"
      :key="node.id"
      :data-id="node.id"
      :class="[
        getNodeBorder(node).image,
        getNodeStatus(node.id).selected ? 'node-item--active' : ''
      ]"
      :style="{
        transform: getNodePosition(node),
        width: `${getNodeSize}px` ?? 0,
        height: `${getNodeSize}px` ?? 0,
      }">
      <view class="node-item__choice-wrap"
        :class="[getNodeBorder(node).mask]"
        v-if="node.node_type?.type.includes('CHOICE')">
        <image class="node-item__icon-bg"
          v-for="choice in getNodeIconBg(node)" :key="choice"
          :src="choice"
        />
      </view>
      <image
        v-else
        class="node-item__icon-bg"
        :class="[getNodeBorder(node).mask]"
        :src="getNodeIconBg(node)"
      />

      <!--      TODO: 被选中的node显示 -->
      <view v-show="node.ranks?.length > 1" class="node-item__rank">
        <text>{{ getNodeStatus(node.id).rank }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
$col-width: calc(100% / 10);
.tree-container {
  position: relative;
  box-sizing: border-box;
  margin: 0 auto;

  .canvas-wrap {
    height: 100%;
    width: 100%;
  }

  .node-item {
    position: absolute;
    left: 0;
    top: 0;
    padding: 4rpx;
    box-sizing: border-box;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    filter: grayscale(1);
    display: flex;
    justify-content: center;
    align-items: center;

    .node-item__icon-bg {
      width: calc(100% - 2px);
      height: calc(100% - 2px);
      mask-mode: alpha; /* 根据透明度裁剪 */
    }

    .node-item__icon-mask-spell {
      mask-image: url("@/static/images/wow/talent/spell-mask.svg");
    }

    .node-item__icon-mask-passive {
      border-radius: 50%;
    }

    .node-item__icon-mask-choice {
      mask-image: url("@/static/images/wow/talent/choice-mask.svg");
    }

    .node-item__choice-wrap {
      width: 100%;
      height: 100%;
      border-radius: 26rpx;
      overflow: hidden;
      position: relative;

      image {
        &:first-child {
          position: absolute;
          right: 50%;
          top: 0;
        }

        &:last-child {
          position: absolute;
          left: 50%;
          top: 0;
        }
      }
    }

    .node-item__rank {
      position: absolute;
      bottom: -6rpx;
      right: -6rpx;
      height: 30rpx;
      width: 30rpx;
      border-radius: 50%;
      background: red;
      color: #fff;
      text-align: center;
      font-weight: bold;
      font-size: 24rpx;
      line-height: 30rpx;
    }
  }

  .node-item--active {
    filter: none;
  }

  .node-item__bg-spell {
    background-image: url("@/static/images/wow/talent/spell.svg");;
  }

  .node-item__bg-passive {
    background-image: url("@/static/images/wow/talent/passive.svg");;
  }

  .node-item__bg-choice {
    background-image: url("@/static/images/wow/talent/choice.svg");;
  }
}

</style>
