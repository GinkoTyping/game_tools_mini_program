<script setup lang="ts">
import { getSpellImageUrl, type TalentNode } from '@/api/wow';
import { computed, getCurrentInstance, ref } from 'vue';
import { onReady } from '@dcloudio/uni-app';

const data = defineModel('modelValue', {
  type: Array<TalentNode>, default() {
    return [];
  },
});

const TREE_PADDING = 20;
const COL_WIDTH = `calc((100vw - ${TREE_PADDING}rpx * 2) / 10)`;
const CONTAINER_HEIGHT = `calc((100vw - ${TREE_PADDING}rpx * 2) / 10 * 15)`;
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
const getSpellBg = computed(() => {
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

// region edge
const instance = getCurrentInstance();
const canvasId = ref(`canvas_${Date.now()}`);
const canvasWidth = ref();
const canvasOffset = computed(() => ({
  x: canvasWidth.value * 0.15,
  y: canvasWidth.value * 0.15,
}));
const canvasHeight = ref();

function getLinePoint(row: number, col: number) {
  return [canvasOffset.value.x * (col - 1 + 1 / 3), canvasOffset.value.y * (row - 2 + 1 / 3)];
}

async function drawContent(width, height) {
  console.log('父节点宽高:', width, height);
  const ctx = uni.createCanvasContext(canvasId.value, instance);
  canvasWidth.value = width;  // 画布实际像素宽度
  canvasHeight.value = height;

  ctx.clearRect(0, 0, width, height);

  data.value.forEach((node) => {
    if (node.unlocks?.length) {
      const beginPoint = getLinePoint(node.display_row, node.display_col);
      node.unlocks.forEach((childId) => {
        const childNode = data.value.find((item) => item.id === childId);
        if (childNode) {
          const endPoint = getLinePoint(childNode?.display_row, childNode.display_col);

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
function init() {
  const query = uni.createSelectorQuery().in(instance);

  // 选择父节点并获取尺寸
  query.select(`.tree-container__id__${canvasId.value} .canvas-wrap`)
    .boundingClientRect((res: any) => {
      if (res) {
        drawContent(res.width, res.height);
      }
    })
    .exec();
}

onReady(() => {
  init();
});
</script>

<template>
  <view class="tree-container"
    :class="[`tree-container__id__${canvasId}`]"
    :style="{ height: CONTAINER_HEIGHT, width: `calc(100vw - ${TREE_PADDING}rpx * 2)` }">
    <view class="canvas-wrap">
      <canvas
        :canvas-id="canvasId"
        :id="canvasId"
        :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
      ></canvas>
    </view>
    <view class="node-item"
      v-for="node in data"
      :key="node.id"
      :class="[getBorder(node).image]"
      :style="{
        transform: getPosition(node),
        width: COL_WIDTH,
        height: COL_WIDTH,
      }">
      <view class="node-item__choice-wrap"
        :class="[getBorder(node).mask]"
        v-if="node.node_type?.type.includes('CHOICE')">
        <image class="node-item__icon-bg"
          v-for="choice in getSpellBg(node)" :key="choice"
          :src="choice"
        />
      </view>
      <image
        v-else
        class="node-item__icon-bg"
        :class="[getBorder(node).mask]"
        :src="getSpellBg(node)"
      />

      <!--      TODO: 被选中的node显示 -->
      <view v-show="node.ranks?.length > 1" class="node-item__rank">
        <text>{{ node.ranks?.length }}</text>
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

    .node-item__icon-bg {
      width: 100%;
      height: 100%;
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
      bottom: 0;
      right: 0;
      height: 20rpx;
      width: 20rpx;
      border-radius: 50%;
      background: red;
      color: #fff;
      font-weight: bold;
      font-size: 20rpx;
    }
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
