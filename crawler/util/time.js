export function formatDate(secondTime) {
  const date = secondTime ? new Date(secondTime) : new Date();
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function formatDateByMinute(secondTime) {
  const date = secondTime ? new Date(secondTime) : new Date();
  const time = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
  return time;
}

const DAY_TIME = 24 * 60 * 60 * 1000;
export function formatNextDay(date) {
  if (date) {
    const startDate = new Date(date).getTime();
    const endDate = startDate + DAY_TIME;
    return formatDateByMinute(endDate);
  }
  return null;
}
