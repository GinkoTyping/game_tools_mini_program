<template>
  <uni-notice-bar
    v-if="isShowNotice"
    single
    show-icon
    show-get-more
    color="#2979FF"
    background-color="#EAF2FF"
    more-text="去看看"
    text="点赞重要的机制，提醒其他玩家吧~"
    @click="onClickNotice"
  />
  <uni-section id="overview" class="shaman" title="总览">
    <view class="divide-section">
      <view class="prefix">
        <view class="icon"></view>
        <view class="title">大秘境路线</view>
      </view>
      <view
        class="suffix"
        @click="() => exportRouteCode(mythicDungeonData?.routes[0]?.code)"
      >
        <uni-icons type="download-filled" color="#007aff" size="20"></uni-icons>
        <text> 点击复制MDT代码</text>
      </view>
    </view>
    <uni-card class="section-card">
      <image
        class="route-image"
        mode="widthFix"
        lazy-load
        :src="mythicDungeonData?.routes[0]?.imageSrc"
        @click="() => preiviewImage(mythicDungeonData?.routes[0]?.imageSrc)"
      />
    </uni-card>
    <view class="divide-section">
      <view class="prefix">
        <view class="icon"></view>
        <view class="title">难度</view>
      </view>
    </view>
    <uni-card class="section-card">
      <Rating :data="mythicDungeonData?.ratings" />
    </uni-card>
  </uni-section>
  <uni-section id="utility" class="shaman" title="相关驱散技能">
    <uni-card class="section-card">
      <view class="menu">
        <text
          v-for="utility in mythicDungeonData?.utilityNeeds"
          :key="utility.type"
          @click="() => switchUtilityType(utility.type)"
          :class="[
            'ellipsis',
            currentUtilityType === utility.type ? 'menu_active' : '',
          ]"
        >{{ utility.type }}
        </text
        >
      </view>

      <uni-title
        type="h4"
        :title="`敌方的“${currentUtilityType}”`"
        color="#027fff"
      ></uni-title>

      <uni-list>
        <uni-list-item
          v-for="item in currentUtility?.spell"
          :title="item.nameZH"
          :note="item.desc"
          :key="item.spellNameZH"
        />
      </uni-list>

      <uni-title
        type="h4"
        :title="`友方的驱散技能`"
        color="#027fff"
      ></uni-title>
      <uni-list>
        <uni-list-item
          class="utility"
          :class="[item?.roleClass.toLowerCase().replaceAll(' ', '-')]"
          v-for="item in currentUtility?.utility"
          :title="`${item.roleClassZH} - ${item?.nameZH}`"
          :note="item?.showDesc ? item?.desc?.trim() : ''"
          :showArrow="!item?.showDesc"
          :rightText="item?.showDesc ? '' : '点击任意处查看详情'"
          clickable
          @click="() => swicthShowSpellDesc(item)"
          :key="item.nameZH"
        >
        </uni-list-item>
      </uni-list>
    </uni-card>
  </uni-section>

  <template
    v-for="(tip, tipIndex) in mythicDungeonData?.enemyTips"
    :key="tip?.title"
  >
    <ad-custom
      v-if="tip.isAd"
      unit-id="adunit-ee147e8714106b66"
      style="margin-top: 1rem"
    ></ad-custom>
    <uni-section
      v-else
      :id="getEnemySectionId(tipIndex)"
      :class="[isBossTip(tip.type) ? 'section-title--boss' : 'shaman']"
      :title="tip?.title"
    >
      <uni-collapse @change="(e: any) => onCollapseChange(tipIndex, e)">
        <uni-collapse-item
          v-if="tip?.data?.length"
          v-for="(dataItem, index) in tip.data"
          :key="index"
          :id="`${tip.type}-${dataItem.trashId ?? dataItem.spellId}`"
          :open="defaultOpenTip(tip.type, dataItem.trashId ?? dataItem.spellId)"
        >
          <template v-slot:title>
            <view class="menu-title-slot">
              <uni-icons
                class="menu-title-slot__marked animate__animated"
                :class="[
                  hasMarked(dataItem, tip.type)
                    ? 'animate__fadeInDown'
                    : 'animate__fadeOut',
                ]"
                color="rgb(244, 123, 0)"
                type="star-filled"
                size="14"
              ></uni-icons>
              <text
                :class="[
                  'menu-title',
                  isBossTip(tip.type) ? 'menu-title--highlight' : '',
                ]"
              >{{
                  dataItem?.trashName ||
                  dataItem?.spellNameZH ||
                  dataItem?.spellNameEN
                }}
              </text
              >
              <view
                class="menu-title-slot__sub"
                v-if="dataItem?.spellId || dataItem?.trashId"
                :class="[
                  dataItem.count ? 'menu-title-slot__sub--highlight' : '',
                ]"
              >
                <view> ({{ dataItem.count }}
                  <text>提醒</text>
                  )
                </view>
              </view>
            </view>
          </template>
          <view class="tip-image-container">
            <image
              v-if="
                dataItem?.imageSrc &&
                openedcollapseItems.includes(`${tipIndex}-${index}`)
              "
              :class="[`${tip.type}-image`]"
              mode="heightFix"
              :src="dataItem?.imageSrc"
              @click="() => preiviewImage(dataItem?.imageSrc)"
            />
          </view>
          <view
            class="ul-l1 list-style"
            v-for="(spellTip, spellTipIndex) in dataItem?.data"
            :key="spellTipIndex"
          >
            <rich-text :nodes="renderTip(spellTip.text)"></rich-text>
            <view
              class="ul-l2 list-style-empty"
              v-if="spellTip.children?.length"
              v-for="(child1Tip, child1Index) in spellTip.children"
              :key="child1Index"
            >
              <rich-text :nodes="renderTip(child1Tip.text)"></rich-text>
              <view
                class="ul-l3 list-style-empty"
                v-if="child1Tip.children?.length"
                v-for="(child2Tip, child2Index) in child1Tip.children"
                :key="child2Index"
              >
                <rich-text :nodes="renderTip(child2Tip.text)"></rich-text>
              </view>
            </view>
          </view>
          <view class="buttons" v-if="dataItem?.spellId || dataItem?.trashId">
            <view
              class="buttons-item"
              @click="
                () =>
                  markTip(dataItem, !hasMarked(dataItem, tip.type), tip.type)
              "
            >
              <uni-icons
                :type="
                  hasMarked(dataItem, tip.type) ? 'hand-up-filled' : 'hand-up'
                "
                :color="
                  hasMarked(dataItem, tip.type) ? 'rgb(244, 123, 0)' : '#bbb'
                "
                size="26"
              ></uni-icons>
              <text class="buttons-item-count">{{ dataItem.count }}</text>
              <text
                class="buttons-item-tip animate__animated"
                :class="[
                  openedcollapseItems.includes(`${tipIndex}-${index}`)
                    ? 'animate__fadeInRight'
                    : '',
                ]"
                v-show="!hasMarked(dataItem, tip.type)"
              >(这条攻略重要吗？点赞提醒其他玩家吧)
              </text
              >
            </view>
          </view>
        </uni-collapse-item>
      </uni-collapse>
    </uni-section>
  </template>

  <ad-custom
    unit-id="adunit-ee147e8714106b66"
    style="margin-top: 1rem"
  ></ad-custom>

  <uni-section id="loot-pool" class="shaman" title="装备掉落">
    <uni-card class="section-card">
      <view class="menu">
        <text
          v-for="loot in mythicDungeonData?.lootPool"
          :key="loot.type"
          @click="() => switchLootType(loot.type)"
          :class="[
            'ellipsis',
            currentLootType === loot.type ? 'menu_active' : '',
          ]"
        >{{ loot.type }}
        </text
        >
      </view>

      <uni-table ref="table" stripe emptyText="暂无更多数据">
        <uni-tr>
          <uni-th width="45" align="left">部位</uni-th>
          <uni-th width="160" align="left">装备</uni-th>
        </uni-tr>
        <uni-tr v-for="(item, index) in currentLootTable" :key="index">
          <uni-td>{{ item.type }}</uni-td>
          <uni-td>
            <view
              class="slot-container"
              @click="() => switchDetail(true, item)"
            >
              <img :src="item.imageSrc" style="width: 14px; height: 14px" />
              <view class="ellipsis" style="flex: 1">{{ item.name }}</view>
            </view>
          </uni-td>
        </uni-tr>
      </uni-table>
    </uni-card>
  </uni-section>
  <view class="footer"></view>
  <ShareIcon />

  <uni-popup ref="menuPopup" type="left" background-color="rgb(43, 44, 44)">
    <uni-title
      type="h3"
      title="点击前往"
      align="center"
      color="#fff"
    ></uni-title>
    <uni-list class="menu-list">
      <uni-list-item
        title="1. 总览"
        clickable
        showArrow
        @click="() => scrollTo('#overview')"
      ></uni-list-item>
      <uni-list-item
        title="2. 相关驱散技能"
        clickable
        showArrow
        @click="() => scrollTo('#utility')"
      ></uni-list-item>
      <uni-list-item
        v-for="(item, index) in mythicDungeonData?.enemyTips.filter(
          item => !item.isAd
        )"
        :title="`${index + 3}. ${item?.title}`"
        :class="[item.type === 'boss' ? 'menu-list--highlight' : '']"
        clickable
        showArrow
        @click="
          () => scrollTo(`#${getEnemySectionId(index > 2 ? index + 1 : index)}`)
        "
      >
      </uni-list-item>
      <uni-list-item
        :title="`${mythicDungeonData?.enemyTips?.length - 1 + 3}. 装备掉落`"
        clickable
        showArrow
        @click="() => scrollTo('#loot-pool')"
      ></uni-list-item>
    </uni-list>
  </uni-popup>

  <uni-popup ref="itemPopup">
    <ItemPopover
      :status="status"
      :itemDetail="currentDetails"
      :image-src="currentItem.imageSrc"
    />
  </uni-popup>

  <view class="meun-switch" @click="() => switchMenuPopup(true)">
    <uni-icons type="list" color="#fff" size="22"></uni-icons>
  </view>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref } from 'vue';
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';
import { storeToRefs } from 'pinia';

import { queryMythicDungeonById, queryUpdateMarkStatus } from '@/api/wow';
import { renderTip } from '@/hooks/richTextGenerator';
import Rating from '@/components/rating.vue';
import ShareIcon from '@/components/ShareIcon.vue';
import ItemPopover from '@/components/ItemPopover.vue';
import { useUserStore } from '@/store/wowStore';
import { queryItemPreview } from '@/api/wow';

const mythicDungeonData = ref();
const dungeonId = ref();
const userStore = useUserStore();
const { marks }: { marks: any } = storeToRefs(userStore);

//#region 装备悬浮提示栏
const itemPopup = ref<any>('');
const currentDetails = ref<any>({});
const currentItem = ref<any>({});
const status = ref('loading');

async function switchDetail(
  isShow: boolean,
  item: { image: string; id: number; type: string },
) {
  currentDetails.value = {};
  if (isShow) {
    status.value = 'loading';
    itemPopup.value.open();

    currentItem.value = item;
    const { data, statusCode } = await queryItemPreview(item.id);
    if (statusCode === 200) {
      currentDetails.value = data;
      status.value = '';
    } else {
      itemPopup.value.close();
    }
  }
}

//#endregion

//#region 跳转到指定TIP
const jumpParams = ref<{ type: string; guideId: number }>();
const defaultOpenTip = computed(
  () => (type, id) =>
    type === jumpParams.value?.type &&
    Number(id) === Number(jumpParams.value?.guideId),
);

function scrollToTip() {
  if (jumpParams.value?.type && jumpParams.value.guideId) {
    nextTick(() => {
      uni.pageScrollTo({
        selector: `#${jumpParams.value?.type}-${jumpParams.value?.guideId}`,
      });
    });
  }
}

//#endregion

onLoad(async (options: any) => {
  jumpParams.value = options;
  await userStore.updateUserMarks();

  dungeonId.value = options.id;
  mythicDungeonData.value = await queryMythicDungeonById(options.id ?? 382);
  mythicDungeonData.value.enemyTips.splice(2, 0, { isAd: true, title: 'ad' });

  currentUtilityType.value = mythicDungeonData.value?.utilityNeeds[0].type;
  currentLootType.value = mythicDungeonData.value?.lootPool[0].type;
  uni.setNavigationBarTitle({
    title: `大秘境 —— ${mythicDungeonData.value?.nameZH ?? '未知名称'}`,
  });

  scrollToTip();
});

onShareAppMessage(() => {
  return {
    title: `${mythicDungeonData.value?.nameZH}·大秘境攻略`,
    path: `pages/mythic-dungeon/index?id=${dungeonId.value}`,
  };
});

function exportRouteCode(code: string) {
  uni.setClipboardData({
    data: code,
    success: function() {
      uni.showToast({
        title: '已复制, 可导入到MDT插件中',
        icon: 'none',
      });
    },
  });
}

function preiviewImage(url: string) {
  uni.previewImage({
    urls: [url],
    indicator: 'number',
    loop: true,
  });
}

const currentUtilityType = ref('');
const currentUtility = computed(() =>
  mythicDungeonData.value?.utilityNeeds.find(
    (item: any) => item.type === currentUtilityType.value,
  ),
);

function switchUtilityType(type: string) {
  if (currentUtilityType.value !== type) {
    currentUtilityType.value = type;
  }
}

function swicthShowSpellDesc(item: any) {
  item.showDesc = !item.showDesc;
}

const currentLootType = ref('');
const currentLootTable = computed(
  () =>
    mythicDungeonData.value?.lootPool.find(
      (item: any) => item.type === currentLootType.value,
    )?.loots ?? [],
);

function switchLootType(type: string) {
  if (currentLootType.value !== type) {
    currentLootType.value = type;
  }
}

const menuPopup = ref();

function switchMenuPopup(isOpen: boolean) {
  if (isOpen) {
    menuPopup.value?.open?.();
  }
}

const getEnemySectionId = computed(() => {
  return (index: number) => {
    return `enemy-section-${index}`;
  };
});

function scrollTo(selector: string) {
  uni.pageScrollTo({
    selector,
  });
  nextTick(() => {
    menuPopup.value?.close?.();
  });
}

const isBossTip = computed(() => (type: string) => type === 'boss');

// 控制展开collapse面板时，触发collapse内部的动画
const openedcollapseItems = ref<string[]>([]);

function onCollapseChange(tipIndex: number, e: string[]) {
  const mapKey = e.map(item => `${tipIndex}-${Number(item)}`);
  mapKey.push(...openedcollapseItems.value);
  openedcollapseItems.value = [...new Set(mapKey)];
}

const isShowNotice = ref(true);

function onClickNotice() {
  scrollTo('#enemy-section-0');
  isShowNotice.value = false;
}

const hasMarked = computed(() => {
  return (item: any, tipType: string) => {
    const markId = item[tipType === 'trash' ? 'trashId' : 'spellId'];
    return marks.value[tipType === 'trash' ? 'npcs' : 'spells'].includes(
      Number(markId),
    );
  };
});

let lastMarkTime = 0;

async function markTip(
  dataItem: { trashId: number; spellId: number; count: number },
  isMark: boolean,
  tipType: string,
) {
  // 防抖
  const now = Date.now();
  if (now - lastMarkTime < 300) {
    return;
  }
  lastMarkTime = now;

  const isNpc = tipType === 'trash';
  const markId = dataItem[tipType === 'trash' ? 'trashId' : 'spellId'];
  const userId = uni.getStorageSync('userId');

  await queryUpdateMarkStatus({ isNpc, isMark, userId, markId });
  await userStore.updateUserMarks();

  updateLocalMarkCount(isNpc, isMark, markId);
}

function updateLocalMarkCount(isNpc: boolean, isMark: boolean, markId: number) {
  const key = isNpc ? 'trashId' : 'spellId';
  mythicDungeonData.value.enemyTips.forEach((tipkind: any) => {
    if (
      (isNpc && tipkind.type === 'trash') ||
      (!isNpc && tipkind.type === 'boss')
    ) {
      tipkind.data.forEach((item: any) => {
        if (Number(item[key]) === Number(markId)) {
          isMark ? item.count++ : item.count--;
        }
      });
    }
  });
}
</script>

<style lang="scss" scoped>
.slot-container {
  display: flex;
}

.ul-l1 {
  padding-right: 1rem;
  line-height: 20px;
  font-size: 14px;
  margin-left: 30px;
  color: #fff;

  .ul-l2 {
    margin-left: 16px;

    .ul-l3 {
      margin-left: 16px;
    }
  }
}

.list-style,
.list-style-empty {
  position: relative;

  &::before {
    content: '';
    position: absolute;
    width: 4px;
    height: 4px;
    top: 8px;
    left: -12px;
    border-radius: 50%;
    border: 1px solid #fff;
  }
}

.list-style {
  &::before {
    background-color: #fff;
  }
}

::v-deep .uni-collapse {
  background-color: $uni-bg-color-grey-light !important;

  .uni-collapse-item__title-box {
    background-color: $uni-bg-color-grey-light !important;
  }
}

::v-deep uni-collapse-item {
  width: 100vw;

  .uni-collapse-item__title.uni-collapse-item-border {
    line-height: 40px;
    border-bottom: 4px solid $uni-bg-color-grey;
    padding-left: 18px;
    box-sizing: border-box;
    font-size: 16px;
  }

  .uni-collapse-item__title.is-open {
    border-bottom-color: $uni-bg-color-grey-lighter !important;
    background-color: $uni-bg-color-grey-lighter !important;
  }

  .uni-collapse-item__wrap {
    background-color: $uni-bg-color-grey !important;

    .uni-collapse-item__wrap-content {
      border: none !important;
      border-bottom: 8px solid $uni-bg-color-grey !important;
      padding: 0.4rem 0;
      background-color: $uni-bg-color-grey-lighter !important;
    }
  }
}

.section-title--boss {
  color: $color-b-tier;
}

.menu-title-slot {
  display: flex;
  align-items: center;
  position: relative;

  .menu-title-slot__marked {
    position: absolute;
    left: -1rem;
  }

  .menu-title-slot__sub {
    margin-left: 0.4rem;
    display: flex;
    align-items: center;
    color: #bbb;
    font-size: 14px;

    text {
      font-size: 12px;
    }
  }

  .menu-title-slot__sub--highlight {
    color: $color-mythic;
  }
}

.menu-title {
  color: #fff;
  font-size: 14px;
  font-weight: bold;
}

.menu-title--highlight {
  color: $color-b-tier;
}

.buttons {
  padding: 0 1rem;
  display: flex;
  align-items: center;

  .buttons-item {
    display: flex;
    align-items: center;
    color: #bbb;
    padding: 0.2rem 0.2rem;

    text {
      margin-left: 4px;
      font-size: 14px;
    }

    .buttons-item-tip {
      font-size: 12px;
      text-decoration: underline;
      font-weight: bold;
    }
  }
}

::v-deep .uni-section {
  .uni-section-header {
    background-color: $uni-bg-color-grey !important;
    color: inherit !important;

    .uni-section-header__content {
      color: inherit !important;

      .uni-section-header__content-sub {
        color: inherit !important;
        text-align: center;
      }

      .uni-section__content-title {
        color: inherit !important;
        text-align: center;
        font-weight: 800;
        font-size: 32rpx !important;
        display: inline-block;
        box-sizing: border-box;

        &::before,
        &::after {
          content: '';
          position: absolute;
          transform: translateY(-50%);
          width: 20%;
          height: 2px;
          background-color: rgb(68, 68, 68);
        }

        &::before {
          left: 0;
          top: 50%;
        }

        &::after {
          right: 0;
          top: 50%;
        }
      }
    }
  }

  .uni-section-content {
    background-color: $uni-bg-color-grey;
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

.route-image,
.trash-image {
  border-radius: 10px;
  object-fit: cover;
}

.route-image {
  width: 100%;
}

.trash-image {
  height: 20vh;
}

.route-download {
  display: flex;
  justify-content: center;
  align-items: center;

  text {
    color: #007aff;
  }
}

:deep(.tip-image-container) {
  display: flex;
  justify-content: center;
  margin-bottom: 0.6rem;

  image {
    max-height: 20vh
  }
}

.uni-section .divide-section:first-child {
  padding-top: 0 !important;
}

.divide-section {
  padding: 1rem;
  padding-bottom: 0.4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 14px;
  line-height: 20px;
  background: transparent;

  .prefix {
    display: flex;

    .icon {
      width: 4px;
      height: 20px;
      border-radius: 10px;
      margin-right: 6px;
      background-color: #2979ff;
    }
  }

  .suffix {
    color: #2979ff;
  }
}

$light-border: rgb(68, 68, 68);
.menu {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  .menu_active {
    color: #ffffff;
    // border-bottom: 4px red solid;
    &::before {
      content: '';
      width: calc(100% - 10px);
      height: 4px;
      background-color: red;
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  text {
    width: 26%;
    margin-bottom: 10px;
    padding: 0 10px;
    font-weight: 800;
    line-height: 30px;
    height: 30px;
    position: relative;
    text-align: center;

    &:not(:last-child):not(:nth-child(3))::after {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 2px;
      height: 10px;
      background-color: $light-border;
    }
  }
}

::v-deep .uni-list {
  .uni-list--border-top,
  .uni-list--border-bottom {
    background-color: $uni-bg-color-grey !important;
  }

  .uni-list-item {
    background-color: $uni-bg-color-grey-lighter !important;

    .uni-list-item__content-title {
      color: #fff;
    }
  }
}

::v-deep .utility {
  .uni-list-item {
    .uni-list-item__content {
      color: inherit !important;

      .uni-list-item__content-title {
        color: inherit !important;
      }
    }
  }
}

.footer {
  height: 4rem;
  width: 1vw;
}

::v-deep .uni-table {
  background-color: rgb(40, 40, 40) !important;
  border: 2px $light-border solid;

  .uni-table-th,
  .uni-table-td {
    padding-left: 4px !important;
    padding-right: 4px !important;
    border-bottom: 1px $uni-bg-color solid !important;

    .slot-container {
      display: flex;
      align-items: center;

      image {
        margin-right: 4px;
      }
    }
  }

  .uni-table-th {
    font-weight: 800;
    color: #ffffff;
  }

  .uni-table-td {
    font-weight: 400;

    &:first-child {
      color: rgb(221, 221, 221);
    }

    &:nth-child(2) {
      color: rgb(163, 53, 238);

      view {
        width: 160px !important;
      }
    }

    &:nth-child(3) {
      color: rgb(221, 221, 221);

      view {
        width: 100px !important;
      }
    }
  }

  .is-loot {
    color: $uni-text-color-inverse !important;
  }
}

::v-deep .menu-list {
  .uni-list-item__content-title {
    color: #bbb !important;
  }

  .menu-list--highlight .uni-list-item__content-title {
    color: $color-b-tier !important;
  }
}

.meun-switch {
  height: 40px;
  width: 40px;
  position: fixed;
  left: 22px;
  bottom: 22px;
  background-color: #007aff;
  border-radius: 50%;
  box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.21);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99;
}
</style>
