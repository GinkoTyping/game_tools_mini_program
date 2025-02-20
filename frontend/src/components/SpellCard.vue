<template>
  <uni-card class="spell-popup">
    <text class="spell-name">{{ props.spell.name_zh }}</text>
    <view class="spell-prop">
      <text
        v-show="props.spell.range && !props.spell.range?.includes('0码')"
        style="width: 100%"
        >{{ props.spell.range }}</text
      >
      <text v-show="props.spell.cast_time?.length">{{
        props.spell.cast_time
      }}</text>
      <text
        v-show="props.spell.cooldown?.length && props.spell.cooldown != 'n/a'"
        >{{ props.spell.cooldown }}</text
      >
      <text v-show="props.spell.cost && props.spell.cost != '无'">{{
        props.spell.cost
      }}</text>
    </view>
    <text class="description">{{ props.spell.description }}</text>
  </uni-card>
</template>

<script lang="ts" setup>
import { ISpell } from '@/interface/IWow';

const props = defineProps({
  spell: {
    type: Object as () => ISpell,
    required: true,
  },
});
</script>

<script lang="ts">
export default {
  name: 'SpellCard',
};
</script>

<style lang="scss" scoped>
.spell-popup > view {
  width: 70vw !important;
  border: 1px solid #ffffff !important;
  border-width: 1px;
  margin-bottom: 10px !important;
  text {
    color: #fff;
  }
  .uni-card__content {
    display: flex;
    flex-direction: column;
  }
  .spell-name {
    font-size: 16px;
    color: #fff !important;
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
  .name {
    color: $color-mythic;
  }
  .qulity,
  .bonus-stat,
  .spell {
    color: $color-uncommon;
  }
  .item-level,
  .description {
    color: $uni-text-color-inverse;
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
</style>
