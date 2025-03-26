export default {
  jobs: {
    index: 0,
    text: '职责',
    value: 'jobs',
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
  classes: {
    index: 1,

    text: '职业',
    value: 'classes',
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
    index: 2,
    text: '游戏风格',
    value: 'gameStyle',
    options: [
      {
        text: '大秘境-低保层',
        value: 'mythic-low',
      },
      {
        text: '大秘境-高层',
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
        text: '收集幻化坐骑',
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
    index: 3,
    text: '活跃时间段',
    value: 'activeTime',
    options: [
      {
        text: '工作日',
        value: 'workDay',
        range: [],
      },
      {
        text: '休息日',
        value: 'weekend',
        range: [],
      },
    ],
  },
  communication: {
    index: 4,
    text: '交流方式',
    value: 'communication',
    options: [
      {
        text: '语音交流',
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
};
