<template>
  <view class="header">
    <uni-segmented-control
      :current="currentTab"
      :values="tabs"
      style-type="button"
      active-color="#007aff"
      @clickItem="switchMenu"
    />
  </view>

  <view style="padding: 0 20rpx">
    <uni-collapse class="tier-list-collapse" ref="collapseRef">
      <uni-collapse-item
        v-for="(item, index) in tierList?.tier_data"
        :key="item.tier"
        open
      >
        <template v-slot:title>
          <view class="collapse-title">
            <text class="collapse-title__tier">{{ item.tier }}</text>
            <text class="collapse-title__tier--suffix">级</text>
            <text class="update-note" v-show="index === 0"
            >({{ tierList?.created_at }} 更新)
            </text
            >
          </view>
        </template>
        <view class="collapse-content">
          <view
            :class="[spec.roleClass, 'collapse-content__card']"
            v-for="spec in item.children"
            :key="spec.fullNameEN"
            @click="() => onClickSpec(spec)"
            :style="{
            backgroundImage: `url(${getClassIconURL(
              spec.roleClass,
              spec.classSpec
            )})`,
          }"
          >
            <image
              v-if="spec.dataChange && spec.dataChange !== '-'"
              class="collapse-content__card__change"
              :src="`/static/icon/${spec.dataChange}.png`"
            />
          </view>
        </view>
      </uni-collapse-item>
    </uni-collapse>
  </view>


  <uni-popup ref="alertDialog" type="dialog">
    <uni-popup-dialog
      type="info"
      cancelText="等会儿"
      confirmText="可以"
      title="提示"
      :content="dialogContent"
      @confirm="dialogConfirm"
      @close="dialogClose"
    ></uni-popup-dialog>
  </uni-popup>
  <ShareIcon />

  <uni-popup
    class="popup-container tier-list-dialog"
    ref="detailPopup"
    mask-background-color="rgba(0,0,0,0.8)"
  >
    <image
      :class="[
        currentSpec?.roleClass ? currentSpec.roleClass : '',
        'spce-icon',
      ]"
      v-if="currentSpec?.roleClass"
      :src="getClassIconURL(currentSpec.roleClass, currentSpec.classSpec)"
    />
    <uni-card class="desc-card">
      <view :class="['desc-card__title', currentSpec?.roleClass]">{{
          currentSpec?.fullNameZH
        }}
      </view>
      <rich-text :nodes="renderTip(currentSpec?.descZH)"></rich-text>
    </uni-card>
    <scroll-view
      v-show="currentSpells?.length"
      scroll-y="true"
      class="scroll-y"
    >
      <view
        class="scroll-y__item"
        v-for="spell in currentSpells"
        :key="spell.id"
      >
        <SpellCard class="spell-card" :spell="spell" />
      </view>
    </scroll-view>
    <view class="popup-container__btn-container">
      <button
        class="popup-container__close-btn"
        @click="() => detailPopup?.close?.()"
      >
        <uni-icons color="#007aff" type="closeempty" size="30"></uni-icons>
      </button>
      <button class="popup-container__spec-btn" @click="dialogConfirm">
        <uni-icons color="#ffffff" type="more-filled" size="30"></uni-icons>
      </button>
    </view>
  </uni-popup>
</template>

<script lang="ts" setup>
import { onLoad, onShareAppMessage, onShow } from '@dcloudio/uni-app';
import { queryTierList } from '@/api/wow';
import { nextTick, ref } from 'vue';

import SpellCard from '@/components/SpellCard.vue';
import { getClassIconURL } from '@/hooks/imageGenerator';
import { renderTip } from '@/hooks/richTextGenerator';
import {
  type ITierListDTO,
  type ITierSpecDetail,
  querySpellsInTip,
} from '@/api/wow';
import ShareIcon from '@/components/ShareIcon.vue';
import { useNavigator } from '@/hooks/navigator';

const navigator = useNavigator();
const tierList = ref<ITierListDTO>();
const currentSpec = ref();
const currentSpells = ref();
const query = ref();

onLoad(async (options: any) => {
  query.value = options;
});

onShow(async (options: any) => {
  if (options && Object.keys(options)?.length > 0) {
    await initPage(options);
  }

  switch (query.value?.role) {
    case 'dps':
      currentTab.value = 0;
      break;
    case 'tank':
      currentTab.value = 1;
      break;
    case 'healer':
      currentTab.value = 2;
      break;
    default:
      break;
  }
});

//#region 顶部menu
const currentTab = ref(0);
const tabs = ref(['输出', '坦克', '治疗']);

function switchMenu(e) {
  if (currentTab.value !== e.currentIndex) {
    if (e.currentIndex != 3) {
      currentTab.value = e.currentIndex;
    }
    const roles = ['dps', 'tank', 'healer'];
    if (e.currentIndex === 3) {
      navigator.toSpecPopularity();
    } else {
      initPage({
        version_id: '11.2 - PTR',
        activity_type: 'MYTHIC',
        role: roles[e.currentIndex],
      });
    }
  }
}

//#endregion

const collapseRef = ref<any>();

async function initPage(params?: any) {
  const { role } = params ?? {};

  tierList.value = await queryTierList({
    versionId: '11.2 - PTR',
    activityType: 'MYTHIC',
    role: role ?? 'DPS',
  });
  nextTick(() => {
    collapseRef.value?.resize();
  });

  uni.showToast({
    title: '专精图标可点击',
    icon: 'none',
  });
}

// const hasTranslatedDesc = computed(() => {
//   return tierList.value?.tier_data?.[0].children?.[0].descZH;
// });

const detailPopup = ref();

async function onClickSpec(spec: ITierSpecDetail) {
  currentSpec.value = spec;

  if (currentSpec.value?.descZH) {
    currentSpec.value = spec;
    currentSpells.value = await querySpellsInTip(
      spec.spells.map(spell => spell.spellId),
    );
    detailPopup.value?.open?.();
  } else {
    confirmToSpecDetail();
  }
}

const alertDialog = ref();
const dialogContent = ref('');

function confirmToSpecDetail() {
  dialogContent.value = `查看关于“${currentSpec.value.fullNameZH}”的更多信息 ~`;
  alertDialog.value?.open?.();
}

function dialogConfirm() {
  navigator.toSpecDetail(
    currentSpec.value.roleClass,
    currentSpec.value.classSpec,
  );
}

function dialogClose() {
  alertDialog.value?.close?.();
}

defineExpose({
  initPage,
});

</script>

<style lang="scss" scoped>
.header {
  padding: 0 20rpx 20rpx;
}

:deep(uni-collapse-item) {

  &:nth-child(1) {
    background-color: $color-s-tier !important;
  }

  &:nth-child(2) {
    background-color: $color-a-tier !important;
  }

  &:nth-child(3) {
    background-color: $color-b-tier !important;
  }

  &:nth-child(4) {
    background-color: $color-c-tier !important;
  }

  &:nth-child(5) {
    background-color: $color-d-tier !important;
  }
}

.collapse-title {
  color: $uni-bg-color;
  font-family: Impact, Haettenschweiler;
  display: flex;
  align-items: baseline;

  .collapse-title__tier {
    min-width: 10px;
    font-size: large;
    margin-right: 4rpx;
    display: block;
  }

  .update-note {
    font-size: small;
    margin-left: 20rpx;
    font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
  }
}

$card-right-margin: 0.4rem;
$card-width: calc((100vw - 4rem - (4 * $card-right-margin)) / 5);
.collapse-content {
  display: flex;
  flex-wrap: wrap;
  padding: 0.4rem 20rpx;
  background-color: black;

  .collapse-content__card {
    margin-right: $card-right-margin;
    width: $card-width;
    height: $card-width;
    border-radius: 50%;
    background-repeat: no-repeat;
    background-size: cover;
    border-width: 0.2rem;
    border-style: solid;
    margin-bottom: 0.4rem;
    position: relative;

    &:nth-child(5),
    &:nth-child(10) {
      margin-right: 0;
    }

    .collapse-content__card__change {
      width: 1rem;
      height: 1rem;
      position: absolute;
      top: 0;
      right: -0.4rem;
    }
  }
}

::v-deep uni-card {
  .uni-card {
    width: 96vw;
    box-sizing: border-box;
    padding: 0 !important;
    margin: 0 auto !important;
    border: none !important;
    background-color: $uni-bg-color-grey-light !important;
  }
}

.desc-card {
  .desc-card__title {
    padding-top: 0.5rem;
    text-align: center;
    font-size: large;
    font-weight: bold;
  }
}

// 技能的上下滚动窗口
.scroll-y {
  margin-top: 1rem;
  max-height: 34vh;

  .scroll-y__item {
    margin-bottom: 0.4rem;
  }
}

.popup-container__spec-btn,
.popup-container__close-btn {
  height: 40px;
  width: 40px;
  padding: 0;
  margin: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow: 0 0 6px 2px rgb(255 255 255 / 21%);

  image {
    width: 50%;
    height: 50%;
  }
}

.popup-container__spec-btn {
  background-color: #007aff;
}

.popup-container__close-btn {
  background-color: #fff;
}

.popup-container__btn-container {
  width: 100%;
  position: relative;
  margin-top: 0.4rem;
  display: flex;
  justify-content: flex-end !important;

  .popup-container__close-btn {
    margin-right: 0.6rem;
  }
}
</style>
