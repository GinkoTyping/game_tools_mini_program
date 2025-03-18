export function useScheduleCheck(hour) {
  const UPDATE_INTERVAL_HOUR = hour ?? 1;
  const UPDATE_INTERVAL = UPDATE_INTERVAL_HOUR * 3600 * 1000;
  let lastUpdateAt = 0;
  return {
    isSchedule() {
      return Date.now() - lastUpdateAt > UPDATE_INTERVAL;
    },
    getLastUpdate() {
      return lastUpdateAt;
    },
    setLastUpdate() {
      lastUpdateAt = Date.now();
    },
  };
}
