<template>
  <view class="item-container">
    <uni-load-more
      v-show="status === 'loading'"
      color="#007AFF"
      :status="status"
    />
    <img
      v-show="imageSrc && status !== 'loading'"
      lazy-load
      class="preview-image"
      :src="imageSrc"
      alt=""
    />
    <view v-show="status !== 'loading' && itemDetail" class="preview-popup">
      <text class="name">{{ itemDetail?.name }}</text>
      <text class="qulity">{{ itemDetail.quality?.name }}</text>
      <!-- TODO 显示的装等和版本不一致 有误导性 -->
      <!-- <text class="item-level">物品等级：{{ itemDetail.level }}</text> -->
      <text class="binding" :class="[bindToBandClass(itemDetail.preview_item?.binding?.name)]">
        {{ itemDetail.preview_item?.binding?.name }}
      </text>
      <text class="gem">{{
          itemDetail.preview_item?.gem_properties?.effect
        }}
      </text>
      <text class="modified-crafting">{{
          itemDetail.modified_crafting?.description
        }}
      </text>
      <view class="type">
        <text>{{ itemDetail.preview_item?.inventory_type?.name }}</text>
        <text v-show="itemDetail.item_class?.id === 2">{{
            itemDetail.preview_item?.item_subclass?.name
          }}
        </text>
      </view>
      <view
        class="damage justify-between"
        v-show="itemDetail.preview_item?.weapon"
      >
        <text>{{
            itemDetail.preview_item?.weapon?.damage?.display_string
          }}
        </text>
        <text>{{
            itemDetail.preview_item?.weapon?.attack_speed?.display_string
          }}
        </text>
      </view>
      <text class="damage-dps">{{
          itemDetail.preview_item?.weapon?.dps?.display_string
        }}
      </text>
      <text
        class="non-bonus-stat"
        v-for="stat in itemDetail.preview_item?.stats?.filter((item: any) => !item.is_equip_bonus)"
      >
        {{ stat.display.display_string }}
      </text>
      <text
        class="bonus-stat"
        v-for="stat in itemDetail.preview_item?.stats?.filter((item: any) => item.is_equip_bonus)"
      >
        {{ stat.display.display_string }}
      </text>
      <text
        class="spell"
        v-show="itemDetail.preview_item?.spells?.length"
        v-for="spell in itemDetail.preview_item?.spells"
        :key="spell.spell.id"
      >{{ spell.description }}
      </text
      >

      <text class="durability">{{
          itemDetail.preview_item?.durability?.display_string
        }}
      </text>
      <text class="requirements" v-show="itemDetail.preview_item?.requirements"
      >{{ itemDetail.preview_item?.requirements?.level.display_string }}
      </text
      >
      <text class="description" v-show="itemDetail.source?.source"
      >来源：
        <text>{{ itemDetail.source?.source }}</text>
      </text
      >
      <text v-show="itemDetail?.description" class="description"
      >“{{ itemDetail.description }}”
      </text
      >
      <view class="price" v-if="itemDetail.preview_item?.sell_price">
        <view>
          <text>售价：</text>
        </view>
        <view>
          <img src="/static/images/wow/money-gold.gif" alt="" srcset="" />
          <text>{{
              itemDetail.preview_item?.sell_price?.display_strings.gold
            }}
          </text>
        </view>
        <view>
          <img src="/static/images/wow/money-silver.gif" alt="" srcset="" />
          <text>{{
              itemDetail.preview_item?.sell_price?.display_strings.silver
            }}
          </text>
        </view>
        <view>
          <img src="/static/images/wow/money-copper.gif" alt="" srcset="" />
          <text>{{
              itemDetail.preview_item?.sell_price?.display_strings.copper
            }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const itemDetail = defineModel('itemDetail', {
  type: Object,
  default: () => ({}),
});
const status = defineModel('status', {
  type: String,
  default: 'loading',
});
const imageSrc = defineModel('imageSrc', {
  type: String,
  default: '',
});

const bindToBandClass = computed(() => (bindText: string) => bindText.includes('战团') ? 'bind--band' : '');
</script>

<style lang="scss" scoped>
.justify-between {
  display: flex;
  justify-content: space-between;
}

.item-container {
  width: 70vw !important;

  .preview-image {
    width: 10vw;
    height: 10vw;
    margin-bottom: 6rpx;
  }

  .preview-popup {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 20rpx;
    margin: 0 auto !important;
    border: 1px solid #ffffff !important;
    background-color: $uni-bg-color-grey-light !important;
    font-size: 28rpx;
    line-height: 46rpx;
    border-radius: 8rpx;

    text {
      color: #fff;
    }

    .spell-name {
      font-size: 16px;
    }

    .spell-prop {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;

      text {
        width: 45%;

        &:nth-child(3),
        &:nth-child(5) {
          text-align: right;
        }
      }
    }

    .bind--band {
      color: $mage
    }

    .name {
      color: $color-mythic;
    }

    .qulity,
    .bonus-stat,
    .spell, .modified-crafting {
      color: $color-uncommon;
    }

    .item-level,
    .description {
      color: $uni-text-color-inverse;

      text {
        color: $uni-text-color-inverse;
        font-weight: bold;
      }
    }

    .price {
      display: flex;

      view {
        display: flex;
        align-items: center;
        margin-right: 4px;
      }

      image {
        width: 16px;
        height: 16px;
        margin-right: 4px;
      }
    }
  }
}
</style>

<style lang="scss" scoped></style>
