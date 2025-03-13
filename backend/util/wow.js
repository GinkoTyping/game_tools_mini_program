const START_TIME = new Date('2025-03-05 8:00:00').getTime();
export function getWeekCount() {
  return Math.ceil((Date.now() - START_TIME) / 3600 / 1000 / 24 / 7);
}
