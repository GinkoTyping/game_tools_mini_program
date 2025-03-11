import { queryLogin } from '@/api/shared';

async function silenceLogin() {
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
async function getToken() {
  const token = uni.getStorageSync('token');
  if (token) {
    return token;
  }
  const data = await silenceLogin();
  return data.token;
}

export function useAuth() {
  return { silenceLogin, getToken };
}
