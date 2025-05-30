<script setup lang="ts">
import { getSpellImageUrl, type TalentNode, type TalentTreeDTO } from '@/api/wow';
import { computed, getCurrentInstance, ref, watch, type PropType, nextTick } from 'vue';
import { onReady } from '@dcloudio/uni-app';

import SpellCard from '@/components/SpellCard.vue';

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
  selectedHeroTree: {
    type: Number,
  },
  selected: {
    type: Array<[number, number, number]>,
    default() {
      return [];
    },
  },
  selectType: {
    type: String,
    default: 'normal',
  },
});

function checkValidNode(node) {
  return node.ranks?.[0]?.tooltip || node.ranks?.[0]?.choice_of_tooltips;
}

const currentTreeData = computed(() => {
  if (props.type === 'spec') {
    return props.data?.spec_talent_nodes?.filter(node =>
      !heroNodeIds.value.includes(node.id)
      && checkValidNode(node));
  }
  if (props.type === 'class') {
    return props.data?.class_talent_nodes?.filter(node => checkValidNode(node));
  }
  if (props.selectedHeroTree) {
    return heroTalentTrees.value.find(tree => tree.id === props.selectedHeroTree)?.hero_talent_nodes ?? [];
  }
  return heroTalentTrees.value?.[0]?.hero_talent_nodes;
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
const getContainerHeight = computed(() => {
  return 1.5 * getNodeSize.value * (coordinateConfig.value.rowCount ?? 1);
});
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

      // 是否选中
      const status = getNodeStatus.value(node.id);
      if (status.selected) {
        return node.ranks?.[0]?.choice_of_tooltips.filter(spellItem => spellItem.spell_tooltip.spell.id === status.spellId)
          .map(spellItem => getSpellImageUrl(spellItem.spell_tooltip.spell.image).item);
      }

      return node.ranks?.[0]?.choice_of_tooltips.map(spellItem => getSpellImageUrl(spellItem.spell_tooltip.spell.image).item);
    }
    return '';
  };
});
const isShowRank = computed(() => {
  return (node: TalentNode) => {
    if (props.selectType === 'normal') {
      return node.ranks?.length > 1 && getNodeStatus.value(node.id).selected;
    }
    return true;
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
  uni.showLoading({
    title: '加载中',
    mask: true,
  });

  try {
    const query = uni.createSelectorQuery().in(instance);
    query.select(`#${canvasId.value}`)
      .fields({ node: true, size: true })
      .exec(async (res) => {
        try {
          if (!res[0]) return;

          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          const dpr = uni.getSystemInfoSync().pixelRatio;

          // 确保 Canvas 尺寸正确
          canvas.width = res[0].width * dpr;
          canvas.height = res[0].height * dpr;
          ctx.scale(dpr, dpr);

          // 使用标准 Canvas API 清除画布
          ctx.clearRect(0, 0, res[0].width, res[0].height);

          ctx.strokeStyle = '#737373'; // 直接赋值颜色
          ctx.lineWidth = 2;         // 直接赋值线宽
          ctx.lineCap = 'round';        // 直接赋值线帽样式
          ctx.beginPath();

          currentTreeData.value?.forEach((node) => {
            if (node.unlocks?.length) {
              const beginPoint = getLinePoint(node.display_row, node.display_col, true);
              node.unlocks.forEach((childId) => {
                const childNode = currentTreeData.value.find((item) => item.id === childId);
                if (childNode) {
                  const endPoint = getLinePoint(childNode?.display_row, childNode.display_col, true);
                  ctx.moveTo(beginPoint[0], beginPoint[1]);
                  ctx.lineTo(endPoint[0], endPoint[1]);
                }
              });
            }
          });

          ctx.stroke();

          // 等待绘制完成
          await new Promise(resolve => {
            if (typeof ctx.draw === 'function') {
              ctx.draw(false, resolve); // 微信基础库 < 2.16.0
            } else {
              setTimeout(resolve, 50); // 兼容无 draw 方法的情况
            }
          });
        } catch (e) {
          console.warn(e);
        } finally {
          uni.hideLoading();
        }

      });
  } catch (e) {
    console.error(e);
  } finally {
    uni.hideLoading();
  }


}

// endregion

// region build
const getNodeStatus = computed(() => {
  return (nodeId: number) => {
    let found = props.selected?.find(([id]) => nodeId === id);
    const matchNodes = props.selected?.filter(([id]) => nodeId === id);
    let selected = false;
    let halfSelectedType = '';
    let rank;
    if (props.selectType === 'normal') {
      rank = found?.[1];
      selected = found !== undefined;
    } else if (matchNodes?.length) {
      found = [...matchNodes].sort((a, b) => b[1] - a[1])[0];
      const ratio = found[1] ? found[1] * 100 : 0;
      if (ratio > 80) {
        selected = true;
      } else if (ratio < 80 && ratio > 50) {
        halfSelectedType = 'node-item--active__80';
      } else if (ratio < 50 && ratio > 20) {
        halfSelectedType = 'node-item--active__50';
      } else {
        halfSelectedType = 'node-item--active__20';
      }
      selected = ratio > 30;
      rank = found[1] ? (found[1] * 100).toFixed(1) + '%' : '0.0%';
    }

    let spellId;
    if (found?.[2]) {
      spellId = found?.[2];
    }

    let subSpellId;
    let subRank;
    if (spellId && matchNodes?.length === 2) {
      const subSpell = matchNodes.filter(node => node[0] !== spellId)[0];
      subSpellId = subSpell[0];
      subRank = subSpell[1] ? (subSpell[1] * 100).toFixed(1) + '%' : '0.0%';
    }

    return {
      halfSelectedType,
      selected,
      rank,
      subRank,
      spellId,
      subSpellId,
    };
  };
});
// endregion

// region 交互
const talentPopup = ref();
const selectedNode = ref<TalentNode>();

function switchTooltip(node: TalentNode) {
  selectedNode.value = node;
  nextTick(() => {
    talentPopup.value?.open();
  });
}

function mapNodeToTooltip(rankItem) {
  const tooltip = rankItem.tooltip;
  return {
    id: tooltip.spell_tooltip.spell.id,
    rank: rankItem.rank,
    name_zh: tooltip.talent.name,
    cast_time: tooltip.spell_tooltip.cast_time,
    cooldown: tooltip.spell_tooltip.cooldown,
    cost: tooltip.spell_tooltip.power_cost,
    range: tooltip.spell_tooltip.range,
    description: tooltip.spell_tooltip.description,

    selected: rankItem.selected,
    selectText: rankItem.selectText,
  };
}

const getNodeTooltips = computed(() => {
  return selectedNode.value?.ranks.reduce((pre, cur) => {
    if (cur.tooltip) {
      pre.push(mapNodeToTooltip(cur));
    } else if (cur.choice_of_tooltips) {
      const status = getNodeStatus.value(selectedNode.value!.id);
      cur.choice_of_tooltips.forEach(item => {
        let spellSelected = false;
        let selectText = '';
        if (props.selectType === 'normal') {
          spellSelected = status.spellId === item.spell_tooltip.spell.id;
          selectText = '当前选择';
        } else if (status.selected) {
          spellSelected = true;
          selectText += '选择率: ';
          selectText += status.spellId === item.spell_tooltip.spell.id ? status.rank : status.subRank;
        }
        pre.push(mapNodeToTooltip({ tooltip: item, selected: spellSelected, selectText }));
      });
    }
    return pre;
  }, [] as any);
});
// endregion

onReady(() => {
  windowWidth.value = uni.getSystemInfoSync().windowWidth;
  setTimeout(() => {
    drawEdge();
  }, 500);
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
        type="2d"
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
        node.node_type?.type.includes('CHOICE') ? 'node-item--choice' : '',
        getNodeStatus(node.id).selected ? 'node-item--active' : '',
        getNodeStatus(node.id).halfSelectedType
      ]"
      :style="{
        transform: getNodePosition(node),
        width: `${getNodeSize}px` ?? 0,
        height: `${getNodeSize}px` ?? 0,
      }"
      @click="() => switchTooltip(node)"
    >
      <view class="node-item__border" :class="[getNodeBorder(node).image]"></view>
      <view class="node-item__choice-wrap"
        :class="[getNodeBorder(node).mask, getNodeStatus(node.id).selected ? 'node-item__choice-wrap--active' : '']"
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

      <view v-show="isShowRank(node)"
        class="node-item__rank"
        :class="[props.selectType === 'heat-map' ? 'node-item__rank--heat-map' : '']">
        <text>{{ getNodeStatus(node.id).rank }}</text>
      </view>
    </view>
  </view>

  <uni-popup ref="talentPopup">
    <SpellCard :spell="spell" v-for="spell in getNodeTooltips" :key="spell.id" />
  </uni-popup>
</template>

<style scoped lang="scss">
$col-width: calc(100% / 10);
.tree-container {
  position: relative;
  box-sizing: border-box;
  margin: 0 auto;

  .canvas-wrap {
    position: relative;
    height: 100%;
    width: 100%;
    z-index: 1;
  }

  .node-item {
    position: absolute;
    left: 0;
    top: 0;
    padding: 4rpx;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;

    .node-item__border {
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
      z-index: -1;
    }

    .node-item__icon-bg {
      width: calc(100% - 2px);
      height: calc(100% - 2px);
      mask-mode: alpha; /* 根据透明度裁剪 */
      z-index: 3;
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
      width: 200%;
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
          right: -50%;
          top: 0;
        }
      }
    }

    .node-item__choice-wrap--active {
      image {
        &:first-child, &:last-child {
          position: absolute;
          right: 0;
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
      border-radius: 15rpx;
      background: red;
      color: #fff;
      text-align: center;
      font-weight: bold;
      font-size: 18rpx;
      line-height: 30rpx;
      z-index: 4;
    }

    .node-item__rank--heat-map {
      width: 80rpx;
      right: 50%;
      transform: translateX(50%);
    }
  }

  .node-item--choice {
    &::before {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translate(-50%, -50%);
      content: '';
      width: 0;
      height: 0;
      border-top: 12rpx solid transparent;
      border-bottom: 12rpx solid transparent;
      border-right: 22rpx solid #808080;
      z-index: 4;
    }

    &::after {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translate(50%, -50%);
      content: '';
      width: 0;
      height: 0;
      border-top: 12rpx solid transparent;
      border-bottom: 12rpx solid transparent;
      border-left: 22rpx solid #808080;
      z-index: 4;
    }
  }

  // region 透明度
  .node-item {
    image, .node-item__rank, .node-item__border {
      filter: grayscale(1);
    }
  }

  .node-item--active {
    image, .node-item__rank, .node-item__border {
      filter: none;
    }
  }

  .node-item--active__80,
  .node-item--active__50,
  .node-item--active__20 {
    .node-item__rank {
      filter: none;
    }
  }

  .node-item--active__80 {
    image {
      filter: saturate(.8) brightness(.7);
    }

    .node-item__rank {
      filter: none;
      background: $demon-hunter;
    }
  }

  .node-item--active__50 {
    image {
      filter: saturate(.8) brightness(.7);
    }

    .node-item__rank {
      filter: none;
      background: $shaman;
    }
  }

  .node-item--active__20 {
    image, .node-item__rank {
      filter: grayscale(1);
    }
  }

  // endregion

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
