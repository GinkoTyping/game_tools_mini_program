const START_TIME = new Date('2026/03/25 15:00:00').getTime();

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
      base: 44,
      thresholds: [
        { start: 0, coefficient: 1.0 },
        { start: 1320, coefficient: 0.9 },
        { start: 1760, coefficient: 0.8 },
        { start: 2200, coefficient: 0.7 },
        { start: 2640, coefficient: 0.6 },
        { start: 3080, coefficient: 0.5 },
        { start: 8800, coefficient: 0.0 },
      ],
    },
    crit: {
      base: 46,
      thresholds: [
        { start: 0, coefficient: 1.0 },
        { start: 1380, coefficient: 0.9 },
        { start: 1840, coefficient: 0.8 },
        { start: 2300, coefficient: 0.7 },
        { start: 2760, coefficient: 0.6 },
        { start: 3220, coefficient: 0.5 },
        { start: 9200, coefficient: 0.0 },
      ],
    },
    vers: {
      base: 54,
      thresholds: [
        { start: 0, coefficient: 1.0 },
        { start: 1620, coefficient: 0.9 },
        { start: 2160, coefficient: 0.8 },
        { start: 2700, coefficient: 0.7 },
        { start: 3240, coefficient: 0.6 },
        { start: 3780, coefficient: 0.5 },
        { start: 10800, coefficient: 0.0 },
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