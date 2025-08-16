import { useAuth } from '@/hooks/auth';

export const BASE_URL = import.meta.env.VITE_BACKEND_URL;

let auth;
export const proxyRequest = async (options: any) => {
  function sendRequest() {
    // 默认请求头
    let header = {
      'Content-Type': 'application/json',
      Authorization: uni.getStorageSync('token')
        ? `Bearer ${uni.getStorageSync('token')}`
        : '',
    };

    // 合并用户自定义请求头
    if (options.header) {
      header = { ...header, ...options.header };
    }

    return uni.request({
      url: BASE_URL + options.url, // 拼接完整URL
      method: options.method || 'GET', // 默认GET方法
      data: options.data || {},
      header: header,
    });
  }

  const data = await sendRequest();

  //如果token过期 自动刷新
  if (data.statusCode === 401) {
    try {
      auth = auth ?? useAuth();
      if (uni.getStorageSync('userId') === 1) {
        uni.showToast({ title: 'token过期 重新请求' });
      }
      await auth.silenceLogin(true);
      if (uni.getStorageSync('userId') === 1) {
        uni.showToast({ title: 'token请求 重发请求' });
      }
      return sendRequest();
    } catch (error: any) {
      if (uni.getStorageSync('userId') === 1) {
        uni.showToast({ title: error?.message });
      }
    }
  }
  return data;
};
