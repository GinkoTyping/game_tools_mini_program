export default {
  server: {
    index: 0,
    text: '服务器',
    value: 'wow_server',
    max: 1,
    filterMax: 1,
    options: [
      {
        text: '国服',
        value: 'china',
      },
      {
        text: '亚服',
        value: 'aisa',
      },
      {
        text: '美服',
        value: 'america',
      },
      {
        text: '欧服',
        value: 'europe',
      },
    ],
  },
  communication: {
    index: 1,
    text: '交流方式',
    value: 'wow_communication',
    max: 1,
    filterMax: 3,
    options: [
      {
        text: '语音连麦',
        value: 'mic',
      },
      {
        text: '打字交流',
        value: 'message',
      },
      {
        text: '安静打本',
        value: 'silence',
      },
    ],
  },
  privacy: {
    index: 2,
    text: '隐私设置',
    value: 'wow_privacy_need_confirm',
    max: 1,
    filterMax: 1,
    options: [
      {
        text: '公开',
        value: 0,
      },
      {
        text: '不公开',
        value: 1,
      },
    ],
  },
  jobs: {
    index: 0,
    text: '主玩职责',
    value: 'wow_jobs',
    max: 3,
    filterMax: 3,
    options: [
      {
        text: '坦克',
        value: 'tank',
      },
      {
        text: '治疗',
        value: 'healer',
      },
      {
        text: '输出',
        value: 'dps',
      },
    ],
  },
  spec: {
    index: 1,
    text: '主玩专精',
    value: 'wow_spec',
    max: 1,
    filterMax: 2,
    options: [],
  },
  classes: {
    index: 2,
    max: 2,
    filterMax: 2,
    text: '副玩职业',
    value: 'wow_classes',
    options: [
      {
        text: '战士',
        value: 'warrior',
      },
      {
        text: '圣骑士',
        value: 'paladin',
      },
      {
        text: '猎人',
        value: 'hunter',
      },
      {
        text: '潜行者',
        value: 'rogue',
      },
      {
        text: '牧师',
        value: 'priest',
      },
      {
        text: '死亡骑士',
        value: 'death-knight',
      },

      {
        text: '萨满祭司',
        value: 'shaman',
      },
      {
        text: '法师',
        value: 'mage',
      },
      {
        text: '术士',
        value: 'warlock',
      },
      {
        text: '武僧',
        value: 'monk',
      },
      {
        text: '德鲁伊',
        value: 'druid',
      },
      {
        text: '恶魔猎手',
        value: 'demon-hunter',
      },
      {
        text: '唤魔师',
        value: 'evoker',
      },
    ],
  },
  gameStyle: {
    index: 3,
    text: '游戏风格',
    value: 'wow_game_style',
    max: 3,
    filterMax: 3,
    options: [
      {
        text: '大秘-低保',
        value: 'mythic-low',
      },
      {
        text: '大秘冲3000',
        value: 'mythic-3000',
      },
      {
        text: '大秘-高层',
        value: 'mythic-high',
      },
      {
        text: '团本',
        value: 'raid',
      },
      {
        text: '地下堡',
        value: 'delves',
      },
      {
        text: '坐骑幻化',
        value: 'collections',
      },
      {
        text: '制造采集',
        value: 'professions',
      },
      {
        text: '小号练级',
        value: 'leveling',
      },
    ],
  },
  activeTime: {
    index: 4,
    text: '活跃时间段',
    value: 'wow_active_time',
    options: [
      {
        text: '工作日',
        value: 'workDay',
        options: [
          {
            text: '清晨',
            value: 'workday_morning',
          },
          {
            text: '半上午-午间',
            value: 'workday_midday',
          },
          {
            text: '下午',
            value: 'workday_afternoon',
          },
          {
            text: '晚上',
            value: 'workday_evening',
          },
          {
            text: '上半夜',
            value: 'workday_late_night',
          },
          {
            text: '下半夜',
            value: 'workday_early_morning',
          },
        ],
      },
      {
        text: '休息日',
        value: 'weekend',
        options: [
          {
            text: '清晨',
            value: 'weekend_morning',
          },
          {
            text: '半上午-午间',
            value: 'weekend_midday',
          },
          {
            text: '下午',
            value: 'weekend_afternoon',
          },
          {
            text: '晚上',
            value: 'weekend_evening',
          },
          {
            text: '上半夜',
            value: 'weekend_late_night',
          },
          {
            text: '下半夜',
            value: 'weekend_early_morning',
          },
        ],
      },
    ],
  },
};
