export function mapIconfont(key: string, value: string) {
  if (key === 'status') {
    switch (value) {
      case '可网恋':
        return {
          icon: 'icon-Heart',
          color: '#f48cba',
        };

      default:
        break;
    }
  }
  if (key === 'game') {
    switch (value) {
      case '魔兽怀旧服':
        return {
          icon: 'icon-World-ofWarcraft',
          color: 'black',
        };
      case '守望先锋':
        return {
          icon: 'icon-overwatch',
          color: 'black',
        };
      case 'CS2':
        return {
          icon: 'icon-counter_strike',
          color: 'black',
        };
      case '无畏契约':
        return {
          icon: 'icon-Valorant',
          color: 'black',
        };
      case '英雄联盟':
      case '英雄联盟手游':
      case '金铲铲之战':
        return {
          icon: 'icon-lol-positive',
          color: 'black',
        };
      case 'DOTA2':
        return {
          icon: 'icon-dota',
          color: 'black',
        };
      case '炉石传说':
        return {
          icon: 'icon-lushichuanshuo',
          color: 'black',
        };
      case 'APEX':
        return {
          icon: 'icon-icons-apex-legends',
          color: 'black',
        };
      case '原神':
        return {
          icon: 'icon-yuanshen-hei',
          color: 'black',
        };
      default:
        break;
    }
  }
  if (key === 'personality') {
    switch (value) {
      case '天秤座':
        return {
          icon: 'icon-constellation-libra',
          color: '#FF69B4', // 粉红色
        };
      case '双子座':
        return {
          icon: 'icon-constellation-gemini',
          color: '#FFFF00', // 鲜黄色
        };
      case '狮子座':
        return {
          icon: 'icon-constellation-leo',
          color: '#FFD700', // 金色
        };
      case '处女座':
        return {
          icon: 'icon-constellation-virgo',
          color: '#808080', // 灰色
        };
      case '天蝎座':
        return {
          icon: 'icon-constellation-scorpio',
          color: '#8B008B', // 深紫色
        };
      case '金牛座':
        return {
          icon: 'icon-constellation-taurus',
          color: '#00FF00', // 亮绿色
        };
      case '射手座':
        return {
          icon: 'icon-constellation-sagittarius',
          color: '#4B0082', // 靛蓝色
        };
      case '水瓶座':
        return {
          icon: 'icon-constellation-aquarius',
          color: '#00FFFF', // 青色
        };
      case '巨蟹座':
        return {
          icon: 'icon-constellation-cancer',
          color: '#C0C0C0', // 银色
        };
      case '白羊座':
        return {
          icon: 'icon-constellation-aries',
          color: '#FF0000', // 红色
        };
      case '摩羯座':
        return {
          icon: 'icon-constellation-capricorn',
          color: '#8B4513', // 鞍褐色
        };
      case '双鱼座':
        return {
          icon: 'icon-constellation-pisces',
          color: '#00BFFF', // 深天蓝色
        };
      default:
        break; // 或根据需求返回默认值
    }
  }
  return {
    icon: '',
    color: '',
  };
}
