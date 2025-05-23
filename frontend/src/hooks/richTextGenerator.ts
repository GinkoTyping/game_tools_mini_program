import { computed } from 'vue';

export const renderTip = computed(() => {
  return (
    text: string,
    fontSize: string = '28rpx',
    strongFontSize: string = '28rpx',
    color: string = '#fff',
  ) => {
    if (text) {
      const wrappedText = `<p style="font-size: ${fontSize};color: ${color} !important">${text}</p>`;

      return wrappedText.replace(
        /\[(.*?)\]/g,
        (match, p) =>
          `<b style="font-size: ${strongFontSize};color: rgb(255, 209, 0); font-weight: bold;">${p}</b>`,
      );
    }
    return '';
  };
});
