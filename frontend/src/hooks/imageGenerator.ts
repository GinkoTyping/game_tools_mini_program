import { computed } from 'vue';

export const getClassIconURL = computed(() => {
  return (roleClass: string, classSpec: string) =>
    `https://ginkolearn.cyou/api/wow/assets/class-icons/${roleClass}-${classSpec}-class-icon.webp`;
});

export const getWotlkItemIcon = computed(() => (url: string) => `https://ginkolearn.cyou/api/wow/assets/blizz-media-image-wotlk/${url}`);
