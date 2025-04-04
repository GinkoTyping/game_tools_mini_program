export function calculateRelativeTime(inputTime) {
  const targetDate = new Date(inputTime);
  const now = new Date();

  const diffMs = now.getTime() - targetDate.getTime(); // 时间差（毫秒）
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  // 如果时间差为负数（未来时间），直接返回格式化日期
  if (diffMs < 0) {
    return `${targetDate.getFullYear()}年${
      targetDate.getMonth() + 1
    }月${targetDate.getDate()}日`;
  }

  if (diffMinutes === 0) {
    return '刚刚'
  }

  // 1小时内显示x分钟前
  if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  }

  // 判断是否是今天
  const isToday =
    targetDate.getFullYear() === now.getFullYear() &&
    targetDate.getMonth() === now.getMonth() &&
    targetDate.getDate() === now.getDate();

  if (isToday) {
    return `${diffHours}小时前`;
  }

  // 判断是否是昨天
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    targetDate.getFullYear() === yesterday.getFullYear() &&
    targetDate.getMonth() === yesterday.getMonth() &&
    targetDate.getDate() === yesterday.getDate();

  if (isYesterday) {
    return '昨天';
  }

  // 更早时间返回年月日
  return `${targetDate.getFullYear()}年${
    targetDate.getMonth() + 1
  }月${targetDate.getDate()}日`;
}
