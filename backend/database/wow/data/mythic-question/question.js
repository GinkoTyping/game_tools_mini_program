export default [
  //#region 水闸行动
  // 小怪部分(4题)
  {
    guide_type: 'trash',
    guide_id: 229251,
    question_text: {
      text: '当[风险投资公司建筑师]使用[快速建造]跃上高塔时，团队应优先处理什么目标？',
      options: [
        {
          value: 0,
          text: '立即转火击毁建造的塔楼',
        },
        {
          value: 1,
          text: '全力攻击建筑师本体',
        },
        {
          value: 2,
          text: '治疗被定身玩家',
        },
      ],
      answer: {
        value: 0,
        text: '必须摧毁塔楼破除[雄踞高地]减伤效果（技能说明：塔存在时建筑师减伤90%）',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 229252,
    question_text: {
      text: '[暗索土狼]的[嗜血狞笑]未被及时打断时，猎人应该使用什么技能补救？',
      options: [
        {
          value: 0,
          text: '安抚野兽',
        },
        {
          value: 1,
          text: '冰冻陷阱',
        },
        {
          value: 2,
          text: '误导仇恨',
        },
      ],
      answer: {
        value: 0,
        text: '该效果属于激怒类，猎人可通过[安抚野兽]解除（攻略特别说明补救方式）',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 231014,
    question_text: {
      text: '当[载货机器人]对玩家施放[上紧发条]时，被点名者应该如何应对？',
      options: [
        {
          value: 0,
          text: '立即远离人群',
        },
        {
          value: 1,
          text: '开启个人减伤硬抗',
        },
        {
          value: 2,
          text: '集合分摊伤害',
        },
      ],
      answer: {
        value: 0,
        text: '被锁定玩家需远离人群避免3.5码范围持续伤害（技能说明：每0.3秒造成物理伤害）',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 231312,
    question_text: {
      text: '[风险投资公司电工]的[过载]未被及时驱散会导致什么后果？',
      options: [
        {
          value: 0,
          text: '玩家昏迷5秒',
        },
        {
          value: 1,
          text: '全团AOE爆炸',
        },
        {
          value: 2,
          text: '召唤额外小怪',
        },
      ],
      answer: {
        value: 0,
        text: '未驱散的[过载]会使玩家眩晕5秒（技能说明：持续12秒后触发昏迷）',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 469981,
    question_text: {
      text: '[老大娘]开启[夺命封锁屏障]时，破除护盾的正确方法是？',
      options: [
        {
          value: 0,
          text: '击杀所有召唤的无人机',
        },
        {
          value: 1,
          text: '打断BOSS的施法',
        },
        {
          value: 2,
          text: '站在电能法阵输出',
        },
      ],
      answer: {
        value: 0,
        text: '必须击杀全部4个暗炉机甲（技能说明：屏障通过击杀无人机解除）',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 460156,
    question_text: {
      text: '[老大娘]进入[快速启动]阶段时，团队应该采取什么策略？',
      options: [
        {
          value: 0,
          text: '全力爆发输出BOSS',
        },
        {
          value: 1,
          text: '分散躲避能量冲击',
        },
        {
          value: 2,
          text: '优先清理地面效果',
        },
      ],
      answer: {
        value: 0,
        text: '此时BOSS受到伤害提高200%是输出最佳时机（技能说明：12秒内易伤200%）',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 459779,
    question_text: {
      text: '[破拆双人组]中，如何利用布隆特的[滚桶冲锋]机制处理定时炸弹？',
      options: [
        {
          value: 0,
          text: '用最后一次冲锋击飞近战区炸弹',
        },
        {
          value: 1,
          text: '优先冲锋最远玩家',
        },
        {
          value: 2,
          text: '无视炸弹直接输出',
        },
      ],
      answer: {
        value: 0,
        text: '坦克应引导最后一次冲锋处理近战范围炸弹（攻略说明：坦克总是最后冲锋目标）',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 473690,
    question_text: {
      text: '当玩家被[动能胶质炸药]点名时，最佳驱散时机是？',
      options: [
        {
          value: 0,
          text: '周围有3个以上炸弹时',
        },
        {
          value: 1,
          text: '立即驱散减少伤害',
        },
        {
          value: 2,
          text: 'BOSS读条时驱散',
        },
      ],
      answer: {
        value: 0,
        text: "需等待炸弹聚集后驱散以最大化击飞效果（攻略强调'不要急于驱散'）",
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 470039,
    question_text: {
      text: '[沼面]释放[割喉藤蔓]时，被连接的玩家移动时应遵循什么原则？',
      options: [
        {
          value: 0,
          text: '同步同向移动',
        },
        {
          value: 1,
          text: '反向拉扯断开连接',
        },
        {
          value: 2,
          text: '静止不动等待解除',
        },
      ],
      answer: {
        value: 0,
        text: "必须保持移动方向一致避免拉扯伤害（攻略建议'全团统一向左移动'）",
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 473070,
    question_text: {
      text: '[沼面]施放[唤醒沼泽]时，躲避[穿心根须]的关键是？',
      options: [
        {
          value: 0,
          text: '观察地面预警轨迹',
        },
        {
          value: 1,
          text: '开启免疫技能硬抗',
        },
        {
          value: 2,
          text: '紧贴BOSS站位',
        },
      ],
      answer: {
        value: 0,
        text: '需根据地面裂纹预判根须爆发位置（技能说明：根须喷发前有地面预警）',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 468846,
    question_text: {
      text: '[吉泽尔·超震]召唤[跃动火花]时，正确的处理方式是？',
      options: [
        {
          value: 0,
          text: '引导至未通电的水池',
        },
        {
          value: 1,
          text: '风筝火花绕场跑动',
        },
        {
          value: 2,
          text: '集合分摊伤害',
        },
      ],
      answer: {
        value: 0,
        text: '必须将火花引入[水坝渗流]的水池消除（攻略说明：水池会消耗火花）',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 465456,
    question_text: {
      text: '[涡轮增压]阶段出现超死亡闪电光束时，应该如何应对？',
      options: [
        {
          value: 0,
          text: '沿光束移动方向侧向躲避',
        },
        {
          value: 1,
          text: '开启减伤硬抗',
        },
        {
          value: 2,
          text: '跳入带电水池免疫伤害',
        },
      ],
      answer: {
        value: 0,
        text: '光束有缓慢移动轨迹需持续调整走位（技能说明：被命中会昏迷1秒）',
      },
    },
  },

  //#endregion

  //#region 驭雷栖巢
  {
    guide_type: 'trash',
    guide_id: 207198,
    question_text: {
      text: '当[被诅咒的雷霆使]获得[闪电灌注]时，团队应优先执行什么操作？',
      options: [
        {
          value: 0,
          text: '立即驱散魔法增益',
        },
        {
          value: 1,
          text: '转火攻击该单位',
        },
        {
          value: 2,
          text: '开启群体减伤',
        },
      ],
      answer: {
        value: 0,
        text: '必须驱散[闪电灌注]以阻止攻速/施法速度提升（技能说明：魔法增益可被驱散）',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 214421,
    question_text: {
      text: '[凝虚散播者]施放[诱集暗影]时，正确的应对策略是？',
      options: [
        {
          value: 0,
          text: '施法结束时远离中心7码',
        },
        {
          value: 1,
          text: '开启免疫技能硬抗',
        },
        {
          value: 2,
          text: '集合分摊中心伤害',
        },
      ],
      answer: {
        value: 0,
        text: '必须在施法结束前离开中心区域避免爆炸伤害（技能说明：7码内造成额外伤害）',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 212793,
    question_text: {
      text: '[虚空晋升者]引导[晦幽波]时，团队应优先处理？',
      options: [
        {
          value: 0,
          text: '打断引导并躲避虚空球',
        },
        {
          value: 1,
          text: '转火攻击其他小怪',
        },
        {
          value: 2,
          text: '站在生成的池子中输出',
        },
      ],
      answer: {
        value: 0,
        text: '必须打断引导防止持续生成威胁（技能说明：产生移动虚空球和伤害池）',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 214419,
    question_text: {
      text: '[虚咒碾压者]的[溃烂虚空]效果叠加到10层时会导致？',
      options: [
        {
          value: 0,
          text: '坦克治疗效率降低20%',
        },
        {
          value: 1,
          text: '触发全团AOE爆炸',
        },
        {
          value: 2,
          text: '召唤额外小怪',
        },
      ],
      answer: {
        value: 0,
        text: '每层降低2%受治疗效果（技能说明：叠加机制要求快速换坦）',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 444250,
    question_text: {
      text: '[凯里欧斯]释放[闪电涌流]生成水池时，错误的做法是？',
      options: [
        {
          value: 0,
          text: '站在水池边缘输出',
        },
        {
          value: 1,
          text: '穿越闪电洪流快速移动',
        },
        {
          value: 2,
          text: '提前规划移动路径',
        },
      ],
      answer: {
        value: 1,
        text: "闪电洪流实际范围比视觉效果大，穿越会导致秒杀（攻略强调'多走一步远离'）",
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 1214325,
    question_text: {
      text: '应对[崩解闪电]机制时，团队应该如何站位？',
      options: [
        {
          value: 0,
          text: '全团分散8码以上',
        },
        {
          value: 1,
          text: '集合在BOSS脚下',
        },
        {
          value: 2,
          text: '分成两组对称站位',
        },
      ],
      answer: {
        value: 0,
        text: '必须保持分散避免连锁伤害（技能说明：8码范围AOE）',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 424958,
    question_text: {
      text: '[雷卫戈伦]施放[粉碎现实]生成光束时，应该如何应对？',
      options: [
        {
          value: 0,
          text: '观察光束路径侧移躲避',
        },
        {
          value: 1,
          text: '开启减伤硬抗光束伤害',
        },
        {
          value: 2,
          text: '站在生成的池子中',
        },
      ],
      answer: {
        value: 0,
        text: '光束有固定移动轨迹需提前规避（技能说明：路径上造成暗影伤害）',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 424737,
    question_text: {
      text: '处理[混沌腐蚀]减益效果时，正确的传递方式是？',
      options: [
        {
          value: 0,
          text: '靠近队友传递debuff',
        },
        {
          value: 1,
          text: '远离人群等待消失',
        },
        {
          value: 2,
          text: '驱散后立即输出BOSS',
        },
      ],
      answer: {
        value: 0,
        text: '必须5码内传递避免重复叠加（攻略说明：需团队紧凑站位）',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 423305,
    question_text: {
      text: '[虚空石畸体]施放[虚无颠覆]生成碎片时，携带[驭雷者电荷]的玩家应该？',
      options: [
        {
          value: 0,
          text: '移动接触碎片进行清除',
        },
        {
          value: 1,
          text: '远离碎片避免爆炸',
        },
        {
          value: 2,
          text: '站在治疗指定位置',
        },
      ],
      answer: {
        value: 0,
        text: '电荷结束时自动清除接触的碎片（技能说明：电荷可摧毁碎片）',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 445262,
    question_text: {
      text: '击破[虚空壳壁]护盾后，团队应该执行什么操作？',
      options: [
        {
          value: 0,
          text: '全力爆发输出BOSS',
        },
        {
          value: 1,
          text: '优先处理觉醒小怪',
        },
        {
          value: 2,
          text: '分散躲避后续技能',
        },
      ],
      answer: {
        value: 0,
        text: '护盾破碎后BOSS进入100%易伤阶段（技能说明：20秒眩晕+增伤）',
      },
    },
  },

  //#endregion

  //#region 暗焰裂口
  {
    guide_type: 'boss',
    guide_id: '421875',
    question_text: {
      text: '[老蜡须]释放[驱“烛”外敌]时，玩家应该如何应对矿车？',
      options: [
        {
          value: 0,
          text: '将杂务工引到矿车路径上击杀',
        },
        {
          value: 1,
          text: '远离铁轨避免被击退',
        },
        {
          value: 2,
          text: '主动触碰矿车获得增益效果',
        },
      ],
      answer: {
        value: 0,
        text: '矿车会秒杀普通劳工，需利用其清除[杂务工]。站在铁轨附近引导矿车撞击杂务工可有效控制数量，避免叠加[粗制武器]流血效果',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: '422150',
    question_text: {
      text: '[老蜡须]释放[鲁莽冲锋]时，正确的应对方式是？',
      options: [
        {
          value: 0,
          text: '最远距离玩家主动引导冲锋方向',
        },
        {
          value: 1,
          text: '全团集中分摊冲锋伤害',
        },
        {
          value: 2,
          text: '开启减伤硬抗塌方点',
        },
      ],
      answer: {
        value: 0,
        text: '冲锋锁定最远玩家，需由指定人员引导至场地边缘，避免塌方点出现在人群密集区域',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 210812,
    question_text: {
      text: '遇到[皇家点芯者]时，必须优先处理哪个机制？',
      options: [
        {
          value: 0,
          text: '打断[点芯箭]并驱散[闪点]',
        },
        {
          value: 1,
          text: '优先击杀召唤的鼹鼠',
        },
        {
          value: 2,
          text: '躲避地面火焰池',
        },
      ],
      answer: {
        value: 0,
        text: '[点芯箭]需要打断防止随机点杀，[闪点]魔法效果必须驱散避免持续dot伤害',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 210818,
    question_text: {
      text: '[低贱的鼹鼠倌]释放[鼹鼠狂暴]时，正确的处理是？',
      options: [
        {
          value: 0,
          text: '打断法术并集火运货鼹鼠',
        },
        {
          value: 1,
          text: '远离BOSS 20码规避',
        },
        {
          value: 2,
          text: '开启群体减伤硬抗',
        },
      ],
      answer: {
        value: 0,
        text: '必须打断[鼹鼠狂暴]防止召唤激怒鼹鼠，同时优先击杀被强化的[运货鼹鼠]',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 211228,
    question_text: {
      text: '[炽焰魔]的哪个技能需要紧急打断？',
      options: [
        {
          value: 0,
          text: '[爆炸烈焰]的全团易伤',
        },
        {
          value: 1,
          text: '普攻附带的火焰dot',
        },
        {
          value: 2,
          text: '召唤小火元素的技能',
        },
      ],
      answer: {
        value: 0,
        text: '[爆炸烈焰]会给全团叠加火焰易伤，必须打断否则层数叠加后会造成团灭',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 212412,
    question_text: {
      text: '面对[灰鼻 <蛮虐者>]时，哪个行为最危险？',
      options: [
        {
          value: 0,
          text: '不打断[烈焰系链]',
        },
        {
          value: 1,
          text: '站在蜡烛燃烧区域',
        },
        {
          value: 2,
          text: '不规避[不息烈焰]',
        },
      ],
      answer: {
        value: 0,
        text: '未打断的[烈焰系链]会造成长时间定身+持续伤害，需要魔法驱散且容易导致减员',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: '423099',
    question_text: {
      text: '[布雷炙孔]释放[燃焰地狱火]时，正确的策略是？',
      options: [
        {
          value: 0,
          text: '主动引导[点芯弹幕]点燃更多蜡烛',
        },
        {
          value: 1,
          text: '全团集中分担火焰伤害',
        },
        {
          value: 2,
          text: '保留蜡烛用于后续阶段',
        },
      ],
      answer: {
        value: 0,
        text: '每根被点燃的蜡烛可降低[燃焰地狱火]层数，需要主动用[点芯弹幕]点燃更多蜡烛',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: '422700',
    question_text: {
      text: '应对[布雷炙孔]的[灭火强风]，正确做法是？',
      options: [
        {
          value: 0,
          text: '引导龙卷风熄灭1根蜡烛制造安全区',
        },
        {
          value: 1,
          text: '全力躲避所有龙卷风',
        },
        {
          value: 2,
          text: '开启反伤技能反弹伤害',
        },
      ],
      answer: {
        value: 0,
        text: '必须故意让龙卷风熄灭1根蜡烛，在后续[点燃]阶段保留安全区域站位',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: '420696',
    question_text: {
      text: '[蜡烛之王]的[投掷暗焰]应该优先命中？',
      options: [
        {
          value: 0,
          text: '玩家蜡像',
        },
        {
          value: 1,
          text: 'BOSS本体',
        },
        {
          value: 2,
          text: '运货鼹鼠',
        },
      ],
      answer: {
        value: 0,
        text: '被[投掷暗焰]击碎的蜡像可消除[诡谀铸模]的全团AOE，但需注意产生的蜡池',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: '422806',
    question_text: {
      text: '[黑暗之主]战中，蜡烛热量即将耗尽时应？',
      options: [
        {
          value: 0,
          text: '拾取守卫掉落的蜡块补充',
        },
        {
          value: 1,
          text: '全员开启自保技能',
        },
        {
          value: 2,
          text: '转移到新蜡烛位置',
        },
      ],
      answer: {
        value: 0,
        text: '击杀[烛台守卫]掉落蜡块，对蜡烛使用可恢复50点热量，是维持光源的关键',
      },
    },
  },
  //#endregion

  //#region 圣焰隐修院
  {
    guide_type: 'boss',
    guide_id: 424419,
    question_text: {
      text: '[戴尔克莱上尉]释放[战斗狂啸]时，团队应该如何应对？',
      options: [
        {
          value: 0,
          text: '立即打断并优先击杀可信卫士',
        },
        {
          value: 1,
          text: '全团开启减伤硬抗伤害',
        },
        {
          value: 2,
          text: '分散站位避免连锁反应',
        },
      ],
      answer: {
        value: 0,
        text: '[战斗狂啸]会为每个可信卫士提供50能量和50%增伤，必须打断并优先处理守卫避免伤害暴涨',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: '424628',
    question_text: {
      text: '[戴尔克莱上尉]的[人多势众]机制要求团队？',
      options: [
        {
          value: 0,
          text: '每次只激活1名守卫战斗',
        },
        {
          value: 1,
          text: '集中AOE所有守卫',
        },
        {
          value: 2,
          text: '坦克单独拉走BOSS',
        },
      ],
      answer: {
        value: 0,
        text: '每多1名守卫会使伤害提高200%，必须控制守卫激活数量，建议逐个击破',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 212831,
    question_text: {
      text: '遇到[铸炉大师达米安]时，必须优先处理哪个机制？',
      options: [
        {
          value: 0,
          text: '驱散[烈焰圣印]并规避熔岩池',
        },
        {
          value: 1,
          text: '打断[热浪来袭]的减速效果',
        },
        {
          value: 2,
          text: '集火召唤的埃琳娜·艾伯兰兹',
        },
      ],
      answer: {
        value: 0,
        text: '[烈焰圣印]会使全团伤害提高50%并生成致命熔岩池，需立即驱散增益效果',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 212827,
    question_text: {
      text: '[高阶牧师艾姆雅]的[反射护盾]应该如何应对？',
      options: [
        {
          value: 0,
          text: '魔法驱散护盾并停手',
        },
        {
          value: 1,
          text: '物理职业集中爆发',
        },
        {
          value: 2,
          text: '引导至熔岩池消除',
        },
      ],
      answer: {
        value: 0,
        text: '护盾会反弹40%伤害，必须优先驱散魔法效果后再进行输出',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 211289,
    question_text: {
      text: '[泰纳·杜尔玛]的哪个技能需要最高优先级打断？',
      options: [
        {
          value: 0,
          text: '[余烬冲击]的昏迷dot',
        },
        {
          value: 1,
          text: '[火球术]的直伤',
        },
        {
          value: 2,
          text: '[余烬风暴]的地面效果',
        },
      ],
      answer: {
        value: 0,
        text: '[余烬冲击]会造成昏迷+持续伤害的魔法效果，必须优先打断避免减员',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 206710,
    question_text: {
      text: '[光耀之子]生命值低于25%时应？',
      options: [
        {
          value: 0,
          text: '立即击杀防止群体治疗',
        },
        {
          value: 1,
          text: '拉开与其他小怪距离',
        },
        {
          value: 2,
          text: '驱散[纯净御罪]引导',
        },
      ],
      answer: {
        value: 0,
        text: '[强光迸发]会治疗范围内小怪35%生命值，必须在其低血量时快速击杀',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: '446368',
    question_text: {
      text: '[布朗派克男爵]的[献祭葬火]机制要求玩家？',
      options: [
        {
          value: 0,
          text: '避免接触火堆消耗充能',
        },
        {
          value: 1,
          text: '主动踩火堆触发AOE',
        },
        {
          value: 2,
          text: '分散站位防止连锁爆炸',
        },
      ],
      answer: {
        value: 0,
        text: '每次接触火堆会叠加[牺牲烈焰]dot并引发AOE，应严格控制3层充能不触发',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: '423588',
    question_text: {
      text: '[隐修院长穆普雷]进入[圣光屏障]阶段时，应如何应对？',
      options: [
        {
          value: 0,
          text: '打破护盾并打断[拥抱圣光]',
        },
        {
          value: 1,
          text: '远离BOSS躲避AOE',
        },
        {
          value: 2,
          text: '集中治疗坦克压力',
        },
      ],
      answer: {
        value: 0,
        text: '50%血量时会生成免疫打断的护盾，必须快速打破护盾才能打断持续强化的[拥抱圣光]',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: '425544',
    question_text: {
      text: '[隐修院长穆普雷]的[神圣烈焰]应该如何规避？',
      options: [
        {
          value: 0,
          text: '被点名者引导射线走位',
        },
        {
          value: 1,
          text: '全团分散10码站位',
        },
        {
          value: 2,
          text: '开启魔法减伤硬抗',
        },
      ],
      answer: {
        value: 0,
        text: '被射线锁定的玩家应沿场地边缘移动，避免神圣之地覆盖主要战斗区域',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 207949,
    question_text: {
      text: '面对[热心的圣殿骑士]时，必须优先？',
      options: [
        {
          value: 0,
          text: '驱散[圣殿骑士之怒]',
        },
        {
          value: 1,
          text: '打断[圣光狂怒圣印]',
        },
        {
          value: 2,
          text: '躲避奉献区域',
        },
      ],
      answer: {
        value: 0,
        text: '[圣殿骑士之怒]的30%增伤魔法效果必须立即驱散，否则会造成极高群体压力',
      },
    },
  },
  //#endregion

  //#region 燧酿酒庄
  {
    guide_type: 'boss',
    guide_id: '442525',
    question_text: {
      text: '[酿造大师阿德里尔]进入[欢乐时光]阶段时，玩家需要如何处理？',
      options: [
        {
          value: 0,
          text: '拾取灰烬啤酒喂给口渴的顾客',
        },
        {
          value: 1,
          text: '集中火力攻击BOSS破除免疫',
        },
        {
          value: 2,
          text: '站在吧台躲避AOE伤害',
        },
      ],
      answer: {
        value: 0,
        text: '正确答案：玩家需要点击吧台的酒杯，将灰烬啤酒递给顾客来消除[吵闹喧哗]的负面效果。未及时喂食会导致团队受到递增伤害和急速降低。',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: '432179',
    question_text: {
      text: '当[酿造大师阿德里尔]施放[投掷燧酿]时，玩家应该如何应对？',
      options: [
        {
          value: 0,
          text: '开启个人减伤并远离人群',
        },
        {
          value: 1,
          text: '立即打断该技能施法',
        },
        {
          value: 2,
          text: '站在蜜糖池中抵消伤害',
        },
      ],
      answer: {
        value: 0,
        text: '正确答案：该技能会在玩家脚下生成[滚烫蜜糖]，需要开启减伤并注意放置位置。技能不可打断，站在蜜糖池中反而会受到持续伤害。',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 218671,
    question_text: {
      text: '[风险投资公司纵火狂]的[迸发地狱火]需要如何处理？',
      options: [
        {
          value: 0,
          text: '优先魔法驱散',
        },
        {
          value: 1,
          text: '打断施法前摇',
        },
        {
          value: 2,
          text: '分摊伤害',
        },
      ],
      answer: {
        value: 0,
        text: '正确答案：这是可驱散的魔法DOT效果，9秒内造成大量火焰伤害，需要治疗者及时驱散。',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 214668,
    question_text: {
      text: '[风险投资公司主顾]对坦克叠加的[杯卑磕砸]应如何应对？',
      options: [
        {
          value: 0,
          text: '驱散高层流血效果',
        },
        {
          value: 1,
          text: '坦克换嘲消层',
        },
        {
          value: 2,
          text: '远离8码分散',
        },
      ],
      answer: {
        value: 0,
        text: '正确答案：该流血效果可被驱散，当叠加层数过高时应及时驱散。换嘲无法消除已有层数。',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 210269,
    question_text: {
      text: '[雇佣的打手]施放[烈性酒桶]会造成什么效果？',
      options: [
        {
          value: 0,
          text: '全团火焰DOT',
        },
        {
          value: 1,
          text: '击飞当前坦克',
        },
        {
          value: 2,
          text: '召唤可击杀的酒桶',
        },
      ],
      answer: {
        value: 0,
        text: '正确答案：该技能会对全团施加火焰持续伤害效果，需要群体治疗应对。',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 214673,
    question_text: {
      text: '遇到[风味科学家]召唤[失败批次]时，正确的处理方式是？',
      options: [
        {
          value: 0,
          text: '优先转火击杀',
        },
        {
          value: 1,
          text: '打断科学家施法',
        },
        {
          value: 2,
          text: '分散站位躲避',
        },
      ],
      answer: {
        value: 0,
        text: '正确答案：失败批次10秒后会施放全团AOE，必须立即转火击杀。AoE技能可同时处理多个批次。',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: '440134',
    question_text: {
      text: '[艾帕]的[蜂蜜料汁]技能结束时，玩家应该注意什么？',
      options: [
        {
          value: 0,
          text: '远离受影响玩家6码',
        },
        {
          value: 1,
          text: '集合分摊爆炸伤害',
        },
        {
          value: 2,
          text: '打断后续施法',
        },
      ],
      answer: {
        value: 0,
        text: '正确答案：效果结束时会对6码范围造成伤害并留下火池，需要提前分散避免连锁伤害。',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: '435622',
    question_text: {
      text: '[戈尔迪·底爵]施放[遮天蔽日！]时，正确的应对措施是？',
      options: [
        {
          value: 0,
          text: '开启团队减伤应对爆炸',
        },
        {
          value: 1,
          text: '击杀剩余灰烬炸弹',
        },
        {
          value: 2,
          text: '靠近BOSS规避伤害',
        },
      ],
      answer: {
        value: 0,
        text: '正确答案：该技能会引爆所有炸弹造成持续AOE，需要开启群体减伤并确保[燧火创伤]层数不超过2层。',
      },
    },
  },
  //#endregion

  //#region 麦卡贡行动 - 车间
  {
    guide_type: 'trash',
    guide_id: 151657,
    question_text: {
      text: '[炸弹坦克]施放[引爆]时，正确的应对方式是？',
      options: [
        {
          value: 0,
          text: '必须打断，否则全团会受到高额火焰伤害',
        },
        {
          value: 1,
          text: '无需打断，分摊伤害即可',
        },
        {
          value: 2,
          text: '开启个人减伤硬吃',
        },
      ],
      answer: {
        value: 0,
        text: '[引爆]是必须打断的技能，未打断会导致全团范围火焰伤害。技能ID 301088对应此机制。',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 151773,
    question_text: {
      text: '应对[D.0.G.型垃圾场巡犬]的[灼热巨颚]应如何操作？',
      options: [
        {
          value: 0,
          text: '魔法驱散减益效果',
        },
        {
          value: 1,
          text: '打断施法',
        },
        {
          value: 2,
          text: '集合分摊伤害',
        },
      ],
      answer: {
        value: 0,
        text: '[灼热巨颚]是魔法减益效果（技能ID 1217819），需要及时驱散避免持续火焰伤害。',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 144293,
    question_text: {
      text: '[废料处理单位]的[刺破]效果应优先如何处理？',
      options: [
        {
          value: 0,
          text: '驱散坦克的流血效果',
        },
        {
          value: 1,
          text: '打断后续的[超级电钻]',
        },
        {
          value: 2,
          text: '远离BOSS 8码',
        },
      ],
      answer: {
        value: 0,
        text: '[刺破]（技能ID 1215411）是物理流血效果，需优先驱散以降低坦克压力。',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 236033,
    question_text: {
      text: '[金属黏泥]施放[腐蚀泥胶]时，正确的应对是？',
      options: [
        {
          value: 0,
          text: '全团分散避免连锁反应',
        },
        {
          value: 1,
          text: '集合分摊自然伤害',
        },
        {
          value: 2,
          text: '打断施法并集火',
        },
      ],
      answer: {
        value: 0,
        text: '[腐蚀泥胶]（技能ID 1215412）是全团AOE附带治疗吸收效果，需分散站位降低叠加风险。',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 282801,
    question_text: {
      text: '当[坦克大战]BOSS激活[白金外壳]时，应如何应对？',
      options: [
        {
          value: 0,
          text: '将BOSS拉到液压锤下撞击破盾',
        },
        {
          value: 1,
          text: '转火攻击其他机械单位',
        },
        {
          value: 2,
          text: '全员开启减伤硬抗',
        },
      ],
      answer: {
        value: 0,
        text: '撞击液压锤可破除[白金外壳]（技能ID 282801），使BOSS眩晕并移除33%减伤效果。',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 1216443,
    question_text: {
      text: '[坦克大战]中同时击杀两个BOSS的主要原因是？',
      options: [
        {
          value: 0,
          text: '避免触发叠加的[电能风暴]',
        },
        {
          value: 1,
          text: '防止BOSS进入狂暴状态',
        },
        {
          value: 2,
          text: '减少场地上的电锯数量',
        },
      ],
      answer: {
        value: 0,
        text: '[电能风暴]（技能ID 1216443）在单个BOSS死亡时会持续叠加自然伤害，需同步击杀避免灭团。',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 291946,
    question_text: {
      text: '[狂犬K.U.-J.0.]施放[喷射烈焰]时，正确做法是？',
      options: [
        {
          value: 0,
          text: '躲到[垃圾方块]后方规避',
        },
        {
          value: 1,
          text: '集合分摊火焰伤害',
        },
        {
          value: 2,
          text: '打断BOSS施法',
        },
      ],
      answer: {
        value: 0,
        text: '通过[垃圾掩体]（技能ID 291937）可完全规避[喷射烈焰]（技能ID 291946）的全屏伤害。',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 292290,
    question_text: {
      text: '[麦卡贡国王]的[第九十九号协议]机制要求？',
      options: [
        {
          value: 0,
          text: '始终保持近战范围内有玩家',
        },
        {
          value: 1,
          text: '分散超过8码站位',
        },
        {
          value: 2,
          text: '快速击杀召唤的蜘蛛坦克',
        },
      ],
      answer: {
        value: 0,
        text: '[协议: 九十九]（技能ID 292290）在无近战时会秒杀全团，需至少1名近战持续接触BOSS。',
      },
    },
  },

  //#endregion

  //#region 暴富矿区！！
  {
    guide_type: 'trash',
    guide_id: 134232,
    question_text: {
      text: '[雇来的刺客]施放[淬毒之刃]时，正确的应对方式是？',
      options: [
        { value: 0, text: '立即打断施法' },
        { value: 1, text: '集合分摊中毒伤害' },
        { value: 2, text: '开启魔法免疫技能' },
      ],
      answer: {
        value: 0,
        text: '[淬毒之刃]（技能ID 269302）必须打断，否则近战攻击会附加中毒效果，未打断需准备解毒技能',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 136470,
    question_text: {
      text: '[零食商贩]的[冰镇汽水]未被打断时，应如何处理？',
      options: [
        { value: 0, text: '驱散目标魔法效果' },
        { value: 1, text: '集火秒杀施法者' },
        { value: 2, text: '开启团队减伤' },
      ],
      answer: {
        value: 0,
        text: '[冰镇汽水]（技能ID 280604）引导结束后会眩晕目标，眩晕效果是魔法减益，需要及时驱散',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 130488,
    question_text: {
      text: '如何应对[机甲驾驶员]的[激活机甲]？',
      options: [
        { value: 0, text: '使用控制技能打断' },
        { value: 1, text: '优先集火驾驶员' },
        { value: 2, text: '远离激活的机甲' },
      ],
      answer: {
        value: 0,
        text: '[激活机甲]（技能ID 267433）会复活机械化维和者，必须用控制技能打断施法',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 133432,
    question_text: {
      text: '[风险投资公司炼金师]施放[转化：敌人变黏液]时，错误做法是？',
      options: [
        { value: 0, text: '魔法驱散中招玩家' },
        { value: 1, text: '打断后续[腐蚀性化合物]' },
        { value: 2, text: '无视效果继续输出' },
      ],
      answer: {
        value: 2,
        text: '[转化：敌人变黏液]（技能ID 268797）必须打断，未打断需魔法驱散，否则玩家10秒无法行动',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 271898,
    question_text: {
      text: '[投币式群体打击者]激活[硬币磁铁]时，应优先处理？',
      options: [
        { value: 0, text: '让BOSS远离金币堆' },
        { value: 1, text: '打断BOSS技能施放' },
        { value: 2, text: '开启团队减伤技能' },
      ],
      answer: {
        value: 0,
        text: '每吸收一个金币堆会叠加[氪金致胜]（技能ID 271867），使BOSS伤害提高15%，需及时清理',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 256213,
    question_text: {
      text: '[足球炸弹发射器]的正确处理方式是？',
      options: [
        { value: 0, text: '将炸弹踢向BOSS' },
        { value: 1, text: '引爆炸弹远离人群' },
        { value: 2, text: '由坦克硬吃伤害' },
      ],
      answer: {
        value: 0,
        text: '踢炸弹给BOSS施加[炽燃的艾泽里特]（技能ID 256163），避免[定时爆炸]（技能ID 256137）的全团秒杀',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 257597,
    question_text: {
      text: '[艾泽洛克]施放[艾泽里特灌注]时，应如何应对？',
      options: [
        { value: 0, text: '立即转火被强化的地怒者' },
        { value: 1, text: '控制未被强化的地怒者' },
        { value: 2, text: '无视地怒者攻击BOSS' },
      ],
      answer: {
        value: 0,
        text: '被[艾泽里特灌注]（技能ID 257597）强化的地怒者会造成全团AOE，需优先击杀',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 275907,
    question_text: {
      text: '[艾泽洛克]的[地质冲击]应该如何规避？',
      options: [
        { value: 0, text: '靠近BOSS躲避锥形范围' },
        { value: 1, text: '分散到场地边缘' },
        { value: 2, text: '开启位移技能穿过BOSS' },
      ],
      answer: {
        value: 0,
        text: '越靠近BOSS，[地质冲击]（技能ID 275907）的锥形范围越小，更容易躲避',
      },
    },
  },
  //#endregion

  //#region 伤逝剧场
  {
    guide_type: 'trash',
    guide_id: 174197,
    question_text: {
      text: '[战场祭师]施放[通灵箭]时，正确的应对方式是？',
      options: [
        { value: 0, text: '打断[通灵箭]和[不洁热情]' },
        { value: 1, text: '优先驱散治疗吸收效果' },
        { value: 2, text: '集合分摊暗影伤害' },
      ],
      answer: {
        value: 0,
        text: '[通灵箭]（技能ID 330784）和[不洁热情]（技能ID 341902）都需要打断，前者造成治疗吸收，后者为敌人提供吸血效果',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 164506,
    question_text: {
      text: '如何处理[上古队长]的[指挥若定]？',
      options: [
        { value: 0, text: '优先打断并驱散增益' },
        { value: 1, text: '集火击杀周围小怪' },
        { value: 2, text: '开启群体减伤硬抗' },
      ],
      answer: {
        value: 0,
        text: '[指挥若定]（技能ID 330545）会强化周围单位，必须打断[挫志怒吼]（技能ID 330562）并驱散增益',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 167538,
    question_text: {
      text: '[残暴者多基格]施放[暴怒乱舞]时，应如何应对？',
      options: [
        { value: 0, text: '坦克开启主动减伤' },
        { value: 1, text: '全体远离BOSS 20码' },
        { value: 2, text: '驱散物理增伤效果' },
      ],
      answer: {
        value: 0,
        text: '[暴怒乱舞]（技能ID 331316）是高频单体攻击，需要坦克开启技能应对',
      },
    },
  },
  {
    guide_type: 'trash',
    guide_id: 170850,
    question_text: {
      text: '[狂怒的血角]进入[暴脾气]状态时，应优先？',
      options: [
        { value: 0, text: '驱散激怒效果' },
        { value: 1, text: '打断范围AOE技能' },
        { value: 2, text: '风筝怪物绕场移动' },
      ],
      answer: {
        value: 0,
        text: '[暴脾气]（技能ID 333241）是激怒效果，需立即驱散避免全团持续伤害',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 320180,
    question_text: {
      text: '[狭路相逢]BOSS施放[剧毒孢子]时，正确的处理方式是？',
      options: [
        { value: 0, text: '标记并避开地面毒圈' },
        { value: 1, text: '集合分摊爆炸伤害' },
        { value: 2, text: '打断BOSS能量获取' },
      ],
      answer: {
        value: 0,
        text: '[剧毒孢子]（技能ID 320180）生成持续2.5分钟的毒圈，必须严格规避落地区域',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 333292,
    question_text: {
      text: '[灼热之陨]debuff出现时，团队应如何站位？',
      options: [
        { value: 0, text: '全团分散3码以上' },
        { value: 1, text: '集合分摊群体伤害' },
        { value: 2, text: '靠近BOSS减少范围' },
      ],
      answer: {
        value: 0,
        text: '[灼热之陨]（技能ID 333292）会造成3码范围AOE，需要严格分散站位',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 320102,
    question_text: {
      text: '[无堕者哈夫]的[鲜血与荣耀]机制中，正确的应对策略是？',
      options: [
        { value: 0, text: '被选玩家需在45秒内决出胜负' },
        { value: 1, text: '治疗优先进入决斗场支援' },
        { value: 2, text: '无视机制强杀BOSS' },
      ],
      answer: {
        value: 0,
        text: '被[鲜血与荣耀]（技能ID 320102）选中的玩家必须在45秒内决斗，否则会叠加[怯懦]（技能ID 320711）',
      },
    },
  },
  {
    guide_type: 'boss',
    guide_id: 323685,
    question_text: {
      text: '[无尽女皇莫德蕾莎]施放[攫取裂隙]时，应如何应对？',
      options: [
        { value: 0, text: '反向移动抵抗牵引并驱散诅咒' },
        { value: 1, text: '跳入裂隙规避后续伤害' },
        { value: 2, text: '集合站位分担爆炸伤害' },
      ],
      answer: {
        value: 0,
        text: '[攫取裂隙]（技能ID 323685）会产生持续牵引，需反向跑动避免被吸入，中[死亡之攫]（技能ID 323831）需及时驱散',
      },
    },
  },
  //#endregion
];
