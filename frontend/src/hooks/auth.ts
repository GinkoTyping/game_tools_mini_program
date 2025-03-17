import { queryLogin } from '@/api/shared';

async function silenceLogin(force: boolean = false) {
  // 避免重复请求用户身份信息
  if (uni.getStorageSync('userId') && uni.getStorageSync('token') && !force) {
    return {
      token: uni.getStorageSync('token'),
      userId: uni.getStorageSync('userId'),
    };
  }

  const res = await uni.login({
    provider: 'weixin', //使用微信登录
  });
  const { token, userId, error } = await queryLogin(res.code);
  if (error) {
    uni.showToast({ title: error, icon: 'error' });
  } else {
    uni.setStorageSync('token', token);
    uni.setStorageSync('userId', userId);
  }
  return { token, userId };
}
async function getUserInfo() {
  const token = uni.getStorageSync('token');
  const userId = uni.getStorageSync('userId');
  if (token && userId) {
    return {
      token,
      userId,
    };
  }
  return silenceLogin();
}

export function useAuth() {
  return { silenceLogin, getUserInfo };
}
