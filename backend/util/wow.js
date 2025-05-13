const START_TIME = new Date('2025/03/05 15:00:00').getTime();

export function getWeekCount() {
  return Math.ceil((Date.now() - START_TIME) / 3600 / 1000 / 24 / 7);
}

export const classSpecMap = {
  'death-knight': ['blood', 'frost', 'unholy'],
  'demon-hunter': ['havoc', 'vengeance'],
  druid: ['balance', 'feral', 'guardian', 'restoration'],
  mage: ['arcane', 'fire', 'frost'],
  monk: ['brewmaster', 'mistweaver', 'windwalker'],
  paladin: ['holy', 'protection', 'retribution'],
  rogue: ['assassination', 'outlaw', 'subtlety'],
  shaman: ['elemental', 'enhancement', 'restoration'],
  warlock: ['affliction', 'demonology', 'destruction'],
  warrior: ['arms', 'fury', 'protection'],
  evoker: ['devastation', 'preservation', 'augmentation'],
  hunter: ['beast-mastery', 'marksmanship', 'survival'],
  priest: ['discipline', 'holy', 'shadow'],
};

// TODO: 递减区间 https://maxroll.gg/wow/resources/stat-diminishing-returns
export function calculateStatRatio(stat, value) {
  const lowercase = stat.toLowerCase();
  let output;
  switch (lowercase) {
    case 'haste':
      output = Number(value) / 660;
      break;
    case 'mastery':
      return null;
    case 'crit':
      output = Number(value) / 700;
      break;
    case 'vers':
      output = Number(value) / 780;
      break;
    default:
      output = value;
      break;
  }
  return Math.round(output);
}