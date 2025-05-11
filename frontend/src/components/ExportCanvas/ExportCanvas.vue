<template>
  <!-- 隐藏的Canvas容器 -->
  <view :style="canvasStyle as CSSProperties">
    <canvas
      :canvas-id="canvasId"
      :id="canvasId"
      :style="{ width: CANVAS_WIDTH + 'px', height: calculateTotalHeight + 'px' }"
    ></canvas>
  </view>
</template>

<script lang="ts" setup>
import type { CSSProperties, PropType } from 'vue';
import { ref, computed, getCurrentInstance } from 'vue';
import type { IBisItem } from '@/interface/IWow';
import { getImageSrc, getRoleSpecSrc } from '@/api/wow';
import { getRoleClassColor } from '@/utils/wow';
import roleSpecLabelMap from '@/data/zh.json';

interface IExportData {
  title: string;
  roleClass: string;
  classSpec: string;
  bisLabel: string;
  bisItems: Array<IBisItem>;
}

const props = defineProps({
  targetSelector: {
    type: String,
    required: true,
  },
  data: {
    type: Object as PropType<IExportData>,
    default: () => ({}),
  },
  config: {
    type: Object,
    default: () => ({
      backgroundColor: '#282828',
      debug: false,
      quality: 1,
      textColor: '#000000',
      FONT_SIZE: 16,
    }),
  },
});

const emit = defineEmits([ 'success', 'error', 'export-start' ]);

const instance = getCurrentInstance();
const canvasId = ref(`canvas_${Date.now()}`);
const CANVAS_WIDTH = 340;
const calculateTotalHeight = computed(() => props.data?.bisItems.reduce((pre, cur) => {
    pre += PADDING_Y + LINE_HEIGHT / 2 - FONT_SIZE / 2;
    pre += cur.enhancements.length * (LINE_HEIGHT - FONT_SIZE / 2);
    pre += PADDING_Y;
    return pre;
  }, TABLE_HEADER_OFFSET),
);
const canvasStyle = computed(() => {
  return {
    ...(props.config.debug ? {} : {
      position: 'absolute',
      left: '-9999px',
      opacity: 0,
    }),
    width: CANVAS_WIDTH + 'px',
    height: calculateTotalHeight.value + 'px',
  };
});

// 暴露给父组件的方法
const exportToImage = async () => {
  try {
    emit('export-start');

    // 绘制内容
    await drawContent();

    // 生成图片
    const tempPath = await generateImage();

    // 保存到相册
    // await saveToAlbum(tempPath);

    emit('success', tempPath);
    return tempPath;
  } catch (err) {
    emit('error', err);
    throw err;
  }
};

// 核心绘制逻辑
const drawContent = async () => {
  const ctx = uni.createCanvasContext(canvasId.value, instance);

  const totalHeight = calculateTotalHeight.value;
  // 清空画布
  ctx.clearRect(0, 0, CANVAS_WIDTH, totalHeight);

  // 绘制背景
  ctx.setFillStyle('#282828');
  ctx.fillRect(0, 0, CANVAS_WIDTH, totalHeight);

  ctx.setStrokeStyle('rgb(68, 68, 68)');
  ctx.setLineWidth(2);
  ctx.strokeRect(0, 0, CANVAS_WIDTH, totalHeight);

  ctx.setTextBaseline('middle');

  await drawCanvasHeader(ctx, CANVAS_WIDTH);
  drawTableHeader(ctx, CANVAS_WIDTH);
  await drawTableBody(ctx, CANVAS_WIDTH);

  // 确保绘制完成
  await new Promise(resolve => ctx.draw(false, resolve));
  return ctx;
};

function drawLine(ctx, totalWidth, startY) {
  // 重置路径
  ctx.beginPath();

  // 设置线条样式
  ctx.setStrokeStyle('rgb(16, 16, 16)');  // 线条颜色
  ctx.setLineWidth(1);           // 线条宽度
  ctx.setLineCap('round');       // 端点样式：round | square | butt

  // 绘制路径
  ctx.moveTo(0, startY);   // 起点坐标
  ctx.lineTo(totalWidth, startY); // 终点坐标

  ctx.stroke();
}

const CANVAS_HEADER_HEIGHT = 50;
const CANVAS_HEADER_FONT_SIZE = 16;
const CANVAS_HEADER_PADDING_Y = 2;

async function drawCanvasHeader(ctx, totalWidth) {
  await drawImage(
    ctx,
    getRoleSpecSrc(props.data.classSpec, props.data.roleClass).specIcon,
    0,
    0,
    CANVAS_HEADER_HEIGHT,
  );

  ctx.setTextBaseline('middle');
  ctx.setFillStyle(getRoleClassColor(props.data.roleClass));
  ctx.font = `bold ${CANVAS_HEADER_FONT_SIZE}px sans-serif`;
  const SPEC_TEXT_PADDING_LEFT = 10;
  const offsetX = CANVAS_HEADER_HEIGHT + SPEC_TEXT_PADDING_LEFT;
  ctx.fillText(
    `${roleSpecLabelMap[props.data.roleClass][props.data.classSpec]} ${roleSpecLabelMap.class[props.data.roleClass]}`,
    offsetX,
    CANVAS_HEADER_FONT_SIZE,
  );
  ctx.setFillStyle('#fff');
  ctx.fillText(
    `${props.data.bisLabel} 配装参考`,
    offsetX,
    CANVAS_HEADER_HEIGHT - CANVAS_HEADER_FONT_SIZE / 2 - CANVAS_HEADER_PADDING_Y,
  );

  drawLine(ctx, totalWidth, CANVAS_HEADER_HEIGHT);
}

const SLOT_OFFSET = 10;
const ITEM_OFFSET = 60;
const SOURCE_OFFSET = 250;
const TABLE_HEADER_HEIGHT = 50;
const TABLE_HEADER_OFFSET = CANVAS_HEADER_HEIGHT + TABLE_HEADER_HEIGHT;

function drawTableHeader(ctx, totalWidth) {
  const headers = [ '部位', '装备', '来源' ];
  ctx.setLineWidth(2);
  ctx.font = `bold ${FONT_SIZE}px sans-serif`;
  ctx.setFillStyle('#fff');
  ctx.textAlign = 'left';
  headers.forEach((header, index) => {
    let offset;
    if (index === 0) {
      offset = SLOT_OFFSET;
    } else if (index === 1) {
      offset = ITEM_OFFSET;
    } else {
      offset = SOURCE_OFFSET;
    }
    ctx.fillText(header, offset, CANVAS_HEADER_HEIGHT + TABLE_HEADER_HEIGHT / 2);

  });
  drawLine(ctx, totalWidth, TABLE_HEADER_OFFSET);
}

const LINE_HEIGHT = 28;
const FONT_SIZE = 14;
const PADDING_Y = 14;

function drawMultilineText(ctx, text, x, y, lineHeight) {

  // 按换行符分割段落
  const paragraphs = text.replace(/(.{5})(?=.)/gs, '$1\n').split('\n');
  const lineCount = paragraphs.length;
  paragraphs.forEach(paragraph => {
    // 逐行绘制
    ctx.fillText(paragraph, x, y);
    y += lineHeight; // 更新Y坐标
  });

  return lineCount;
}

async function drawTableBody(ctx, totalWidth) {
  let offsetY = TABLE_HEADER_OFFSET;
  if (props.data?.bisItems) {
    for (const row of props.data.bisItems) {
      // 部位
      ctx.font = `normal ${FONT_SIZE}px sans-serif`;
      ctx.setFillStyle('#606266');
      offsetY += PADDING_Y + LINE_HEIGHT / 2 - FONT_SIZE / 2;
      ctx.fillText(row.slot, SLOT_OFFSET, offsetY);

      // 来源
      ctx.setFillStyle(row.source.isLoot ? 'rgb(255, 209, 0)' : '#606266');
      const minWrapCount = drawMultilineText(
        ctx,
        row.source?.source,
        SOURCE_OFFSET,
        offsetY,
        LINE_HEIGHT - FONT_SIZE / 2,
      );

      // 物品 宝石附魔
      ctx.setFillStyle('rgb(163, 53, 238)');
      await drawImage(ctx, getImageSrc(row.image).thumbItem, ITEM_OFFSET, offsetY - FONT_SIZE / 2, FONT_SIZE);
      ctx.fillText(row.name, ITEM_OFFSET + 16, offsetY);

      for (let itemIndex = 0; itemIndex < row.enhancements.length; itemIndex++) {
        offsetY += LINE_HEIGHT - FONT_SIZE / 2;
        const item = row.enhancements[itemIndex];
        await drawImage(ctx, getImageSrc(item.image).thumbItem, ITEM_OFFSET, offsetY - FONT_SIZE / 2, FONT_SIZE);
        ctx.fillText(item.name, ITEM_OFFSET + 16, offsetY);
      }

      // 处理 来源 换行的行数是row的最大行数的情况
      if (minWrapCount > row.enhancements.length + 1) {
        offsetY += (LINE_HEIGHT - FONT_SIZE / 2) * (minWrapCount - 1);
      }

      offsetY += PADDING_Y;
      drawLine(ctx, totalWidth, offsetY);
    }
  }
}

async function drawImage(ctx, url, offsetX, offsetY, size) {
  try {
    const imageRes: any = await new Promise((resolve, reject) => {
      uni.downloadFile({
        url,
        success: resolve,
        fail: reject,
      });
    });
    ctx.drawImage(imageRes.tempFilePath, offsetX, offsetY, size, size);
  } catch (err) {
    console.error('图片加载失败:', err);
  }
}

// 生成临时图片
const generateImage = () => {
  return new Promise((resolve, reject) => {
    uni.canvasToTempFilePath({
      canvasId: canvasId.value,
      quality: props.config.quality,
      success: resolve,
      fail: () => reject(new Error('生成图片失败')),
    }, instance);
  });
};

// 保存到相册
const saveToAlbum = async (res) => {
  await checkAuth();
  return new Promise((resolve, reject) => {
    uni.saveImageToPhotosAlbum({
      filePath: res.tempFilePath,
      success: resolve,
      fail: err => reject(new Error('保存失败: ' + JSON.stringify(err))),
    });
  });
};

// 权限检查
const checkAuth = async () => {
  const { authSetting } = await uni.getSetting();
  if (authSetting['scope.writePhotosAlbum']) return;

  const { confirm } = await uni.showModal({
    title: '权限申请',
    content: '需要相册写入权限',
  });

  if (!confirm) throw new Error('用户拒绝授权');
  await uni.authorize({ scope: 'scope.writePhotosAlbum' });
};

defineExpose({ exportToImage });
</script>
