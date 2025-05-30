<template>
  <uni-card class="spell-popup custom-card">
    <view
      class="spell-name"
    >{{ props.spell.name_zh }}
      <text
        class="spell-name--selected"
        v-if="props.spell.selected"
      >{{ props.spell.selected ? props.spell.selectText : '' }}
      </text>
    </view>
    <view v-show="props.spell.rank">等级{{
        props.spell.rank
      }}
    </view>
    <view class="spell-prop">
      <text
        v-show="props.spell.range && !props.spell.range?.includes('0码')"
        style="width: 100%"
      >{{ props.spell.range }}
      </text
      >
      <text v-show="props.spell.cast_time?.length">{{
          props.spell.cast_time
        }}
      </text>
      <text
        v-show="props.spell.cooldown?.length && props.spell.cooldown != 'n/a'"
      >{{ props.spell.cooldown }}
      </text
      >
      <text v-show="props.spell.cost && props.spell.cost != '无'">{{
          props.spell.cost
        }}
      </text>
    </view>
    <text class="description">{{ description }}</text>
  </uni-card>
</template>

<script lang="ts" setup>
import type { ISpell } from '@/interface/IWow';
import { computed } from 'vue';

interface ISpellCard extends ISpell {
  selected?: boolean;
  selectText?: string;
}

const props = defineProps({
  spell: {
    type: Object as () => ISpellCard,
    required: true,
  },

  singleBreakLine: {
    type: Boolean,
    default: false,
  },
});
const description = computed(() => {
  if (props.singleBreakLine) {
    return props.spell.description.replace(/\n{2,}/g, '\n');
  }
  return props.spell.description;
});
</script>

<script lang="ts">
export default {
  name: 'SpellCard',
};
</script>

<style lang="scss">
.custom-card.spell-popup > view {
  width: 70vw !important;
  box-shadow: inset 0 0 0 1px #FFFFFF !important;
  margin-bottom: 10px !important;

  text, view {
    color: #fff;
  }

  .uni-card__content {
    display: flex;
    flex-direction: column;
  }

  .spell-name {
    font-size: 16px;
    color: #fff !important;

    .spell-name--selected {
      font-size: 12px;
      color: $uni-text-color-inverse;
      text-decoration: underline;
    }
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
