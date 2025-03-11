<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useAuth } from './hooks/auth';

const auth = useAuth();
onLaunch(async () => {
  await auth.silenceLogin();
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
