import { message } from 'antd';

// 确保 message 组件已正确初始化
message.config({
  top: 100,
  duration: 3,
  maxCount: 3,
});

// 响应拦截器
export const responseInterceptor = (response) => {
  const data = response.data;
  //console.log('响应拦截器 - 成功响应:', data);
  
  // 检查响应数据中是否有错误信息
  if (data && (data.error || data.errorMessage || data.error_message)) {
    const errorMessage = data.error || data.errorMessage || data.error_message;
    //console.log('响应拦截器 - 发现错误消息:', errorMessage);
    message.error(errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
  
  // 检查响应状态码表示失败的情况
  if (data && data.success === false && data.message) {
    //console.log('响应拦截器 - 发现业务错误:', data.message);
    message.error(data.message);
    return Promise.reject(new Error(data.message));
  }
  
  return data;
};

export const responseErrorHandler = (error) => {
  //console.log('响应错误处理器 - 错误对象:', error);
  
  // 处理网络错误
  if (!error.response) {
    message.error('网络连接失败，请检查网络设置');
    return Promise.reject(new Error('网络连接失败'));
  }
  
  // 处理不同状态码
  const status = error.response.status;
  const data = error.response.data;
  //console.log('响应错误处理器 - 状态码:', status, '响应数据:', data);
  
  switch (status) {
    case 400:
      // 优先检查 errorMessage 字段
      if (data && data.errorMessage) {
        //console.log('响应错误处理器 - 400错误 - 使用errorMessage:', data.errorMessage);
        //console.log('message.error 方法是否存在:', typeof message.error);
        //console.log('尝试调用 message.error...');
        try {
          message.error(data.errorMessage);
          //console.log('message.error 调用成功');
        } catch (err) {
          //console.error('message.error 调用失败:', err);
          // 备用方案：使用原生 alert
          alert(data.errorMessage);
        }
      } else if (data && data.error) {
        //console.log('响应错误处理器 - 400错误 - 使用error:', data.error);
        message.error(data.error);
      } else if (data && data.error_message) {
        //console.log('响应错误处理器 - 400错误 - 使用error_message:', data.error_message);
        message.error(data.error_message);
      } else {
        //console.log('响应错误处理器 - 400错误 - 使用默认消息');
        message.error(data.message || '请求参数错误');
      }
      break;
    case 401:
      message.error('登录已过期，请重新登录');
      // 清除用户状态
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user-storage');
        window.location.href = '/login';
      }
      break;
    case 403:
      message.error('没有权限访问该资源');
      break;
    case 404:
      message.error('请求的资源不存在');
      break;
    case 500:
      message.error('服务器内部错误');
      break;
    default:
      message.error(data.message || `请求失败 (${status})`);
  }
  
  return Promise.reject(error);
};