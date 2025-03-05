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
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

import { queryMythicDungeonById } from '@/api/wow';
import Rating from '@/components/rating.vue';

const mythicDungeonData = ref();
onLoad(async () => {
  mythicDungeonData.value = await queryMythicDungeonById(382);
  currentUtilityType.value = mythicDungeonData.value?.utilityNeeds[0].type;
  uni.setNavigationBarTitle({
    title: `大秘境 —— ${mythicDungeonData.value?.nameZH ?? '未知名称'}`,
  });
  console.log(mythicDungeonData.value);
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
</script>

<style lang="scss" scoped>
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
          width: 30%;
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

.route-image {
  border-radius: 10px;
  width: 100%; /* 或者你想要的固定宽度 */
  object-fit: cover;
}
.route-download {
  display: flex;
  justify-content: center;
  align-items: center;
  text {
    color: #007aff;
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
</style>
