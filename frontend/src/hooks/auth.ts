import { BASE_URL } from '@/api/config';

export async function queryLogin(code: string) {
  try {
    const res: any = await uni.request({
      url: BASE_URL + `/auth/login`,
      method: 'POST',
      data: {
        code,
      },
    });
    return res.data;
  } catch (error) {
    return { error };
  }
}

async function silenceLogin(isRefresh: boolean = false) {
  // 避免重复请求用户身份信息
  if (
    uni.getStorageSync('userId') &&
    uni.getStorageSync('token') &&
    uni.getStorageSync('refreshToken') &&
    !isRefresh
  ) {
    return {
      token: uni.getStorageSync('token'),
      userId: uni.getStorageSync('userId'),
      refreshToken: uni.getStorageSync('refreshToken'),
    };
  }

  const res = await uni.login({
    provider: 'weixin', //使用微信登录
  });
  const { token, refreshToken, userId, error } = await queryLogin(res.code);
  if (error) {
    uni.showToast({ title: error, icon: 'error' });
  } else {
    uni.setStorageSync('token', token);
    uni.setStorageSync('userId', userId);
    uni.setStorageSync('refreshToken', refreshToken);
  }
  return { token, refreshToken, userId };
}
async function getUserInfo() {
  const token = uni.getStorageSync('token');
  const userId = uni.getStorageSync('userId');
  const refreshToken = uni.getStorageSync('refreshToken');
  if (token && userId) {
    return {
      userId,
      token,
      refreshToken,
    };
  }
  return silenceLogin();
}

export function useAuth() {
  return { silenceLogin, getUserInfo };
}
