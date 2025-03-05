<template>
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
          >{{ utility.type }}</text
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
          :class="[item?.roleClass.toLowerCase()]"
          v-for="item in currentUtility?.utility"
          :title="`${item.roleClassZH} - ${item?.nameZH}`"
          :note="item?.showDesc ? item?.desc?.trim() : ''"
          :showArrow="!item?.showDesc"
          :rightText="item?.showDesc ? '' : '点击任意处查看详情'"
          clickable
          @click="() => swicthShowSpellDesc(item)"
        >
        </uni-list-item>
      </uni-list>
    </uni-card>
  </uni-section>
  <uni-section
    id="utility"
    class="shaman"
    :title="tip?.title"
    v-for="tip in mythicDungeonData?.enemyTips"
    :key="tip?.title"
  >
    <uni-collapse>
      <uni-collapse-item
        v-if="tip?.data?.length"
        v-for="(dataItem, index) in tip.data"
        :key="index"
      >
        <template v-slot:title>
          <view :class="['menu-title']">
            <text>{{ dataItem?.trashName || dataItem?.spellNameZH }}</text>
          </view>
        </template>
        <view class="tip-image-container">
          <image
            :class="[`${tip.type}-image`]"
            :mode="tip.type === 'trash' ? 'heightFix' : 'widthFix'"
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
      </uni-collapse-item>
    </uni-collapse>
  </uni-section>
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
          >{{ loot.type }}</text
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
            <view class="slot-container">
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
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';

import { queryMythicDungeonById } from '@/api/wow';
import { renderTip } from '@/hooks/richTextGenerator';
import Rating from '@/components/rating.vue';
import ShareIcon from '@/components/ShareIcon.vue';

const mythicDungeonData = ref();
const dungeonId = ref();
onLoad(async (options: any) => {
  dungeonId.value = options.id;
  mythicDungeonData.value = await queryMythicDungeonById(options.id ?? 382);
  currentUtilityType.value = mythicDungeonData.value?.utilityNeeds[0].type;
  currentLootType.value = mythicDungeonData.value?.lootPool[0].type;
  uni.setNavigationBarTitle({
    title: `大秘境 —— ${mythicDungeonData.value?.nameZH ?? '未知名称'}`,
  });
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
    success: function () {
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
    (item: any) => item.type === currentUtilityType.value
  )
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
      (item: any) => item.type === currentLootType.value
    )?.loots ?? []
);
function switchLootType(type: string) {
  if (currentLootType.value !== type) {
    currentLootType.value = type;
  }
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
  .uni-collapse-item__wrap {
    background-color: $uni-bg-color-grey !important;

    .uni-collapse-item__wrap-content {
      border: none !important;
      padding: 0.4rem 0;
      background-color: rgb(43, 44, 44) !important;
    }
  }
}
.menu-title {
  color: #fff;
  font-size: 14px;
  font-weight: bold;
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
        font-size: 18px !important;
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
.tip-image-container {
  display: flex;
  justify-content: center;
  margin-bottom: 0.6rem;
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
    background-color: rgb(43, 44, 44) !important;
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
</style>
