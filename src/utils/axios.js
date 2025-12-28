import axios from "axios";
import {
  requestInterceptor,
  requestErrorHandler,
} from "./interceptors/request";
import {
  responseInterceptor,
  responseErrorHandler,
} from "./interceptors/response";

// 创建axios实例
const instance = axios.create({
  baseURL: process.env.NODE_ENV === 'development' 
    ? "http://10.29.127.241:8080/api" 
    : "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 添加请求拦截器
instance.interceptors.request.use(requestInterceptor, requestErrorHandler);
//console.log('✅ 请求拦截器已注册');

// 添加响应拦截器
instance.interceptors.response.use(responseInterceptor, responseErrorHandler);
//console.log('✅ 响应拦截器已注册');

export default instance;