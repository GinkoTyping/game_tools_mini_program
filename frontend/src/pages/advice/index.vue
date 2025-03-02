<template>
  <uni-section class="log death-knight" title="意见(待完成)">
    <uni-card class="section-card">
      <uni-collapse ref="adviceCollapse" title-border="none" :border="false">
        <uni-collapse-item>
          <template v-slot:title>
            <uni-list>
              <uni-list-item
                class="dungeon_tip-title"
                thumb="https://qiniu-web-assets.dcloud.net.cn/unidoc/zh/unicloudlogo.png"
                thumb-size="lg"
                title="名称"
                note="列表描述信息"
                rightText="点击任意位置"
              >
              </uni-list-item>
            </uni-list>
          </template>
          <view>一句话大秘境一句话大秘境一句话大秘境一句话大秘境</view>
        </uni-collapse-item>
      </uni-collapse>
    </uni-card>
  </uni-section>
</template>

<script lang="ts" setup></script>

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

::v-deep .uni-collapse {
  background-color: rgb(40, 40, 40) !important;
  border-radius: 10px;
  .uni-collapse-item__title {
    border-bottom-color: $uni-bg-color !important;
  }

  .uni-collapse-item__title-box {
    border-radius: 10px;
    background-color: rgb(40, 40, 40) !important;
    color: $uni-color-primary;
    font-weight: bold;
    .uni-collapse-item__title-text {
      font-size: 16px !important;
    }
  }
  .uni-collapse-item__wrap-content.uni-collapse-item--border {
    border-bottom-width: 0 !important;
  }
  .uni-collapse-item__wrap-content {
    background-color: rgb(40, 40, 40) !important;
    color: #fff;
    border-bottom-color: $uni-bg-color-grey-light !important;
    .list-style,
    .list-style-empty {
      position: relative;
      &::before {
        content: '';
        position: absolute;
        width: 4px;
        height: 4px;
        top: 10px;
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
    .ul .li {
      margin-left: 16px;
      color: #fff;
      font-weight: normal;
      position: relative;
    }
    & > .ul {
      padding: 0 12px;
      font-size: 14px;
      font-weight: bold;
      color: $uni-color-primary;
      > .li > .ul {
        margin-left: 16px;
        & > .li > .ul {
          margin-left: 16px;
        }
      }
    }
  }
}

::v-deep .uni-list {
  background-color: transparent !important;
  .uni-list--border-top,
  .uni-list--border-bottom {
    height: 0 !important;
  }
  .uni-list-item {
    background-color: transparent !important;
    .uni-list-item__content {
      .uni-list-item__content-title {
        color: $uni-color-primary;
        font-weight: bold;
      }
      text {
      }
    }
  }
}
</style>
