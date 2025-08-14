<script setup lang="ts">
import { ref, computed } from 'vue';

import TopMessage from '@/components/TopMessage.vue';

const props = defineProps({
  classKey: String,
  data: {
    type: Array<{
      talent: string;
      code: string;
      url: string[]
    }>, default: () => [],
  },
});

const currentTalentIndex = ref(0);
const getTalentType = computed(() => {
  return (index: number) => {
    switch (index) {
      case 0:
        return '职业天赋';
      case 1:
        return '英雄天赋';
      case 2:
        return '专精天赋';
      default:
        break;
    }
  };
});

function switchTalent(index: number) {
  if (currentTalentIndex.value !== index) {
    currentTalentIndex.value = index;
  }
}

const messagePopup = ref();
const messageType = ref('success');
const messageText = ref('默认文本');

function exportTalentCode() {
  uni.setClipboardData({
    data: props.data[currentTalentIndex.value].code,
    success: function() {
      messageType.value = 'success';
      messageText.value = '已成功复制天赋代码到粘贴板。';
      messagePopup.value.open();
    },
  });
}

// region 图片加载完成
const isTalentImageLoad = ref(false);

function getTalentImage(url: string) {
  return `https://ginkolearn.cyou/api/wow/assets/talent/${url}`;
}

function onImageLoad(tablentIndex: number, index: number) {
  if (tablentIndex === 0 && index === 2) {
    isTalentImageLoad.value = true;
  }
}

function previewImage(imageIndex: number) {
  const urls = props.data[currentTalentIndex.value].url.map(
    (item: string) => getTalentImage(item),
  );
  uni.previewImage({
    urls: urls,
    current: imageIndex,
    indicator: 'number',
    loop: true,
  });
}

// endregion
</script>

<template>
  <view class="maxroll-talent">
    <uni-segmented-control
      :class="[props.classKey]"
      :current="currentTalentIndex"
      :values="props.data?.map(item => item.talent)"
      style-type="text"
      active-color="#007aff"
      inActiveColor="#fff"
      @clickItem="({ currentIndex }) => switchTalent(currentIndex)"
    />

    <view class="talent" :class="[props.classKey]" title="天赋">
      <uni-card class="section-card">
        <view class="talent-export" @click="exportTalentCode">
          <view>
            <uni-icons
              type="download-filled"
              color="#007aff"
              size="30"
            ></uni-icons>
            <text>复制代码</text>
          </view>
        </view>

        <uni-collapse ref="collapse">
          <uni-collapse-item
            v-for="(url, index) in props.data[currentTalentIndex]
              ?.url"
            :key="index"
            :open="isTalentImageLoad && index === 2"
          >
            <template v-slot:title>
              <uni-list>
                <uni-list-item
                  class="dungeon_tip-title"
                  :title="getTalentType(index)"
                  rightText="点击任意位置"
                >
                </uni-list-item>
              </uni-list>
            </template>
            <image
              class="talent-image"
              mode="widthFix"
              lazy-load
              :src="getTalentImage(url)"
              @load="() => onImageLoad(currentTalentIndex, index)"
              @click="() => previewImage(index)"
            />
          </uni-collapse-item>
        </uni-collapse>
      </uni-card>
    </view>
  </view>

  <TopMessage
    ref="messagePopup"
    v-model:type="messageType"
    v-model:message="messageText"
  />
</template>

<style scoped lang="scss">
:deep(.talent-menu) {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  font-size: 28rpx;

  .menu_active {
    font-weight: bolder;
    font-size: 32rpx;
    border-bottom-width: 4rpx;
    border-bottom-style: solid;

    &::before {
      bottom: 0 !important;
    }
  }

  text {
    max-width: 50%;
    flex: 1;
    display: block;
    text-align: center;
  }
}

.talent-export {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0 0.2rem 0;

  .talent-export__title {
    font-size: 14px;
    font-weight: bold;
    margin-left: 15px;
  }

  text {
    margin-left: 0.4rem;
    color: $uni-color-primary;
  }
}

// TODO: 样式没有生效，实际生效的是index.vue
.maxroll-talent {
  :deep(.segmented-control) {
    gap: 20rpx;
    margin-bottom: 20rpx;

    .segmented-control__item {
      flex: none !important;

      .segmented-control__text {
        font-size: small;
        color: inherit !important;
      }

      .segmented-control__item--text {
        font-weight: bold;
        color: #fff !important;
      }
    }
  }
}
</style>
