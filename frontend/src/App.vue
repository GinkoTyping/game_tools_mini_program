<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useAuth } from './hooks/auth';
import { queryAdCount } from './api/shared';
import { useUserStore } from '@/store/wowStore';

const userStore = useUserStore();
const auth = useAuth();
onLaunch(async () => {
  await auth.silenceLogin();

  // 获取广告的状态
  const userAdInfo = await queryAdCount();
  const isFreeAd = userAdInfo.isFreeAd;
  userStore.isFreeAd = isFreeAd;

  console.log('App Launch');
});
onShow(() => {
  console.log('App Show');
});
onHide(() => {
  console.log('App Hide');
});
</script>
<style lang="scss">
page {
  height: 100vh;
  background-color: $uni-bg-color-grey;
}
</style>
