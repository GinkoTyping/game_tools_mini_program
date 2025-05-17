import { computed } from 'vue';

const accountColor = computed(() => {
  return rank => {
    if (rank === 0) {
      return '#d32121';
    } else if (rank <= 2) {
      return '#e37e00';
    } else if (rank <= 5) {
      return '#f3d037';
    } else if (rank <= 10) {
      return '#c4ff6b';
    } else if (rank <= 20) {
      return '#8092f1';
    } else {
      return 'rgb(221, 221, 221)';
    }
  };
});
const classIconUrl = computed(() => {
  return className =>
    `https://ginkolearn.cyou/api/poe/assets/class-thumb/${className
      .toLowerCase()
      .replaceAll(' ', '-')}.webp`;
});

const displayColumns = computed(() => {
  return (columns, columnDisplay) => {
    return columns?.filter((column, index) => columnDisplay?.[index]);
  };
});

export function useLadderTable() {
  return {
    accountColor,
    classIconUrl,
    displayColumns,
  };
}
