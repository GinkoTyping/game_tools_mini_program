// const BASE_URL = 'http://localhost:3000/api';
const BASE_URL = 'https://ginkolearn.cyou/api';

export const proxyRequest = (options: any) => {
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

  // 返回Promise对象
  return uni.request({
    url: BASE_URL + options.url, // 拼接完整URL
    method: options.method || 'GET', // 默认GET方法
    data: options.data || {},
    header: header,
  });
};
