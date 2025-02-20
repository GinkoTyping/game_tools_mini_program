import { computed } from "vue";

export const renderTip = computed(() => {
  return (text: string) => {
    const wrappedText = `<p style="font-size: 14px;">${text}</p>`;

    return wrappedText.replace(
      /\[(.*?)\]/g,
      (match, p) =>
        `<b style="font-size: 14px;color: rgb(255, 209, 0); font-weight: bold;">${p}</b>`
    );
  };
});