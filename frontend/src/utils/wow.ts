const START_TIME = new Date('2025/03/05 15:00:00').getTime();

export function getWeekCount() {
  return Math.ceil((Date.now() - START_TIME) / 3600 / 1000 / 24 / 7);
}

export function getRoleClassColor(roleClass: string) {
  const map = {
    'death-knight': '#c41e3a',
    shaman: '#0070dd',
    mage: '#3fc7eb',
    warlock: '#8788ee',
    monk: '#00ff98',
    druid: ' #ff7c0a',
    'demon-hunter': '#a330c9',
    paladin: '#f48cba',
    rogue: '#fff468',
    warrior: 'rgb(198, 155, 109)',
    evoker: 'rgb(51, 147, 127)',
    hunter: 'rgb(170, 211, 114)',
    priest: 'rgb(255, 255, 255)',
  };
  return map[roleClass];
}
