<template>
  <!-- 隐藏的Canvas容器 -->
  <view :style="canvasStyle as CSSProperties">
    <canvas
      :canvas-id="canvasId"
      :id="canvasId"
      :style="{ width: width + 'px', height: height + 'px' }"
    ></canvas>
  </view>
</template>

<script lang="ts" setup>
import type { CSSProperties } from 'vue';
import { ref, computed, getCurrentInstance } from 'vue';
import type { IBisItem } from '@/interface/IWow';
import { getImageSrc } from '@/api/wow';

const props = defineProps({
  targetSelector: {
    type: String,
    required: true,
  },
  data: {
    type: Array<IBisItem>,
    default: () => [],
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
const width = ref(Math.min(uni.getSystemInfoSync().safeArea?.width ?? 400, 400));
const height = ref(0);
const canvasStyle = computed(() => ({
  // position: 'absolute',
  // left: '-9999px',
  // opacity: 0,
  width: width.value + 'px',
  height: 200 + 'px',
}));

// 暴露给父组件的方法
const exportToImage = async () => {
  try {
    emit('export-start');

    // 获取目标元素信息
    const rect: any = await getTargetRect();
    // width.value = rect.width;
    height.value = rect.height;

    // 绘制内容
    await drawContent(rect);

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

// 获取目标元素信息（跨组件版）
const getTargetRect = () => {
  return new Promise((resolve, reject) => {
    const parentCtx: any = instance?.parent || instance; // 处理多层组件
    if (parentCtx) {
      uni.createSelectorQuery()
        .in(parentCtx)
        .select(props.targetSelector)
        .boundingClientRect((rect: any) => {
          if (!rect) return reject(new Error('目标元素未找到'));
          resolve({
            ...rect,
            left: rect.left - (parentCtx.$scope ? parentCtx.$scope.$page.$getBoundingClientRect().left : 0),
            top: rect.top - (parentCtx.$scope ? parentCtx.$scope.$page.$getBoundingClientRect().top : 0),
          });
        })
        .exec();
    }
  });
};

// 核心绘制逻辑
const drawContent = async (rect) => {
  const ctx = uni.createCanvasContext(canvasId.value, instance);

  // 清空画布
  ctx.clearRect(0, 0, rect.width, rect.height);

  // 绘制背景
  ctx.setFillStyle('#282828');
  ctx.fillRect(0, 0, rect.width, rect.height);

  // 调试模式
  if (props.config.debug) {
    ctx.setStrokeStyle('rgb(68, 68, 68)');
    ctx.strokeRect(0, 0, rect.width, rect.height);
    ctx.setTextBaseline('middle');

    drawTableHeader(ctx, rect.width);
    await drawTableBody(ctx, rect.width);
  }

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

const SLOT_OFFSET = 10;
const ITEM_OFFSET = 50;
const SOURCE_OFFSET = computed(() => (width.value - ITEM_OFFSET) * 0.8);
const HEADER_HEIGHT = 50;

function drawTableHeader(ctx, totalWidth) {
  const headers = [ '部位', '装备', '来源' ];
  ctx.setLineWidth(2);
  ctx.font = `bold ${FONT_SIZE}px sans-serif`;
  ctx.setFillStyle('#fff');
  headers.forEach((header, index) => {
    let offset;
    if (index === 0) {
      offset = SLOT_OFFSET;
    } else if (index === 1) {
      offset = ITEM_OFFSET;
    } else {
      offset = SOURCE_OFFSET.value;
    }
    ctx.fillText(header, offset, HEADER_HEIGHT / 2);

  });
  drawLine(ctx, totalWidth, HEADER_HEIGHT);
}

const LINE_HEIGHT = 28;
const FONT_SIZE = 14;
const PADDING_Y = 14;

async function drawTableBody(ctx, totalWidth) {
  let offsetY = HEADER_HEIGHT;
  for (const row of props.data) {
    // 部位
    ctx.font = `normal ${FONT_SIZE}px sans-serif`;
    ctx.setFillStyle('#606266');
    offsetY += PADDING_Y + LINE_HEIGHT / 2 - FONT_SIZE / 2;
    ctx.fillText(row.slot, SLOT_OFFSET, offsetY);

    // 来源
    ctx.setFillStyle(row.source.isLoot ? 'rgb(255, 209, 0)' : '#606266');
    ctx.fillText(row.source.source, SOURCE_OFFSET.value, offsetY);

    // 物品 宝石附魔
    ctx.setFillStyle('rgb(163, 53, 238)');
    await drawImage(ctx, getImageSrc(row.image).thumbItem, ITEM_OFFSET, offsetY - FONT_SIZE / 2, FONT_SIZE);
    ctx.fillText(row.name, ITEM_OFFSET + 16, offsetY);
    offsetY += LINE_HEIGHT - FONT_SIZE / 2;

    for (let itemIndex = 0; itemIndex < row.enhancements.length; itemIndex++) {
      const item = row.enhancements[itemIndex];
      await drawImage(ctx, getImageSrc(item.image).thumbItem, ITEM_OFFSET, offsetY - FONT_SIZE / 2, FONT_SIZE);
      ctx.fillText(item.name, ITEM_OFFSET + 16, offsetY);
      if (itemIndex !== row.enhancements.length - 1) {
        offsetY += LINE_HEIGHT - FONT_SIZE / 2;
      }
    }


    offsetY += PADDING_Y;
    drawLine(ctx, totalWidth, offsetY);
  }
}

async function drawImage(ctx, src, offsetX, offsetY, size) {
  try {
    const imageRes: any = await new Promise((resolve, reject) => {
      uni.getImageInfo({
        src,
        success: resolve,
        fail: reject,
      });
    });
    ctx.drawImage(imageRes.path, offsetX, offsetY, size, size);
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
