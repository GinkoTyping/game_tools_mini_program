const START_TIME = new Date('2025/08/13 15:00:00').getTime();

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
  const statConfigs = {
    haste: {
      base: 660,
      thresholds: [
        { start: 0, coefficient: 1.0 },
        { start: 19800, coefficient: 0.9 },
        { start: 26400, coefficient: 0.8 },
        { start: 33000, coefficient: 0.7 },
        { start: 39600, coefficient: 0.6 },
        { start: 46200, coefficient: 0.5 },
        { start: 132000, coefficient: 0.0 },
      ],
    },
    crit: {
      base: 700,
      thresholds: [
        { start: 0, coefficient: 1.0 },
        { start: 21000, coefficient: 0.9 },
        { start: 28000, coefficient: 0.8 },
        { start: 35000, coefficient: 0.7 },
        { start: 42000, coefficient: 0.6 },
        { start: 49000, coefficient: 0.5 },
        { start: 140000, coefficient: 0.0 },
      ],
    },
    vers: {
      base: 780,
      thresholds: [
        { start: 0, coefficient: 1.0 },
        { start: 23400, coefficient: 0.9 },
        { start: 31200, coefficient: 0.8 },
        { start: 39000, coefficient: 0.7 },
        { start: 46800, coefficient: 0.6 },
        { start: 54600, coefficient: 0.5 },
        { start: 156000, coefficient: 0.0 },
      ],
    },
  };

  const lowercaseStat = stat.toLowerCase();
  if (lowercaseStat === 'mastery') {
    return null;
  }

  const config = statConfigs[lowercaseStat];
  if (!config) {
    return Math.round(Number(value));
  }

  const { base, thresholds } = config;
  let total = 0;
  const rawValue = Number(value);

  for (let i = 0; i < thresholds.length - 1; i++) {
    const start = thresholds[i].start;
    const end = thresholds[i + 1].start;
    const coefficient = thresholds[i].coefficient;

    if (rawValue <= start) continue;

    const segmentValue = Math.min(rawValue, end) - start;
    if (segmentValue <= 0) continue;

    total += segmentValue / (base / coefficient);
  }

  return Math.round(total);
}