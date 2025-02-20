<template>
  <button open-type="share">
    <image src="/static/icon/share.svg" />
  </button>
</template>

<style lang="scss" scoped>
button[open-type='share'] {
  height: 40px;
  width: 40px;
  border-radius: 50%;
  position: fixed;
  bottom: 22px;
  right: 22px;
  z-index: 99;
  padding: 0;
  background-color: #007aff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 6px 2px rgb(255 255 255 / 21%);
  image {
    width: 50%;
    height: 50%;
  }
}
</style>
