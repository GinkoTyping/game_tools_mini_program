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
      fontSize: 16,
    }),
  },
});

const emit = defineEmits([ 'success', 'error', 'export-start' ]);

const instance = getCurrentInstance();
const canvasId = ref(`canvas_${Date.now()}`);
const width = ref(Math.min(uni.getSystemInfoSync().safeArea?.width ?? 400, 400));
const height = ref(0);
console.log(uni.getSystemInfoSync());
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
    drawTableBody(ctx, rect.width);
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
  const fontSize = 14;
  ctx.setLineWidth(2);
  ctx.font = `bold ${fontSize}px sans-serif`;
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
    ctx.fillText(header, offset, HEADER_HEIGHT / 2 - fontSize / 2);

  });
  drawLine(ctx, totalWidth, HEADER_HEIGHT);
}

function drawTableBody(ctx, totalWidth) {
  const lineHeight = 28;
  const fontSize = 14;
  const paddingY = 14;
  let offsetY = HEADER_HEIGHT;
  props.data.forEach((row) => {
    // 部位
    ctx.font = `normal ${fontSize}px sans-serif`;
    ctx.setFillStyle('#606266');
    offsetY += paddingY + lineHeight / 2 - fontSize / 2;
    ctx.fillText(row.slot, SLOT_OFFSET, offsetY);

    // 来源
    ctx.setFillStyle(row.source.isLoot ? 'rgb(255, 209, 0)' : '#606266');
    ctx.fillText(row.source.source, SOURCE_OFFSET.value, offsetY);

    // 宝石附魔
    ctx.setFillStyle('rgb(163, 53, 238)');
    row.enhancements.forEach((item, itemIdx) => {
      ctx.fillText(item.name, ITEM_OFFSET, offsetY);
      if (itemIdx !== row.enhancements.length - 1) {
        offsetY += lineHeight - fontSize / 2;
      }
    });

    offsetY += paddingY;
    drawLine(ctx, totalWidth, offsetY);
  });
}

// 下载网络图片
const downloadImage = (url) => {
  return new Promise((resolve, reject) => {
    if (!url.startsWith('http')) {
      resolve(url); // 本地路径直接使用
      return;
    }

    uni.downloadFile({
      url,
      success: res => resolve(res.tempFilePath),
      fail: reject,
    });
  });
};

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
