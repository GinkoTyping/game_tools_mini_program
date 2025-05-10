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

const props = defineProps({
  targetSelector: {
    type: String,
    required: true,
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
const width = ref(0);
const height = ref(0);

const canvasStyle = computed(() => ({
  position: 'absolute',
  left: '-9999px',
  width: width.value + 'px',
  height: height.value + 'px',
  opacity: 0,
}));

// 暴露给父组件的方法
const exportToImage = async () => {
  try {
    emit('export-start');

    // 获取目标元素信息
    const rect: any = await getTargetRect();
    width.value = rect.width;
    height.value = rect.height;

    // 绘制内容
    await drawContent(rect);

    // 生成图片
    const tempPath = await generateImage();

    // 保存到相册
    await saveToAlbum(tempPath);

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

    drawHeader(ctx, rect.width);
  }

  // 确保绘制完成
  await new Promise(resolve => ctx.draw(false, resolve));
  return ctx;
};

function drawHeader(ctx, totalWidth) {
  const headers = [ '部位', '装备', '来源' ];
  let offset = 10;
  ctx.setLineWidth(2);
  ctx.font = 'bold 14px sans-serif';
  ctx.setFillStyle('#000000');
  headers.forEach((header, index) => {
    ctx.fillText(header, offset, 20);
    if (index === 0) {
      offset += 40;
    } else {
      offset += (totalWidth - offset) * 0.6;
    }
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
