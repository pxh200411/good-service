/**
 * API配置文件
 * 集中管理API相关的配置项
 */

// API基础配置
export const API_CONFIG = {
  // API基础URL
  BASE_URL: '/api',
  
  // 超时设置（毫秒）
  TIMEOUT: 10000,
  
  // 默认请求头
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // 上传文件时的请求头
  UPLOAD_HEADERS: {
    'Content-Type': 'multipart/form-data',
  },
  
  // 分页默认设置
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
  
  // 缓存设置
  CACHE: {
    ENABLED: true,
    DEFAULT_TTL: 5 * 60 * 1000, // 5分钟
    LOCATION_DATA_TTL: 24 * 60 * 60 * 1000, // 24小时
  },
  
  // 重试设置
  RETRY: {
    ENABLED: true,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1秒
  },
  
  // 错误码映射
  ERROR_CODES: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    PERMISSION_ERROR: 'PERMISSION_ERROR',
    NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
  },
  
  // HTTP状态码映射
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
};

// API端点配置
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REGISTER_ADMIN: '/api/auth/register-admin',
  },
  
  // 用户相关
  USER: {
    BY_USERNAME: (username) => `/users/${username}`,
    CUSTOMER_LIST: '/users/list/customers',
    ALL_USERS: '/users/list/all',
    EXISTS: (username) => `/users/exists/${username}`,
    UPDATE_PASSWORD: (username) => `/users/password/${username}`,
  },
  
  // 位置相关
  LOCATION: {
    PROVINCES: '/locations/provinces',
    CITIES: (provinceId) => `/locations/cities/${provinceId}`,
    ITEMS: (cityId) => `/locations/items/${cityId}`,
    SEARCH: '/locations/search',
  },
  
  // 服务相关
  SERVICE: {
    BASE: '/services',
    BY_ID: (id) => `/services/${id}`,
    TYPES: '/services/types',
    SEARCH: '/services/search',
    RECOMMENDED: '/services/recommended',
    HOT: '/services/hot',
    REVIEWS: (id) => `/services/${id}/reviews`,
    PROVIDER: (id) => `/services/${id}/provider`,
    FAVORITE: (id) => `/services/${id}/favorite`,
    FAVORITES: '/services/favorites',
    STATS: (id) => `/services/${id}/stats`,
    AVAILABLE_TIMES: (id) => `/services/${id}/available-times`,
    BOOKINGS: (id) => `/services/${id}/bookings`,
    CATEGORIES: '/services/categories',
    TAGS: '/services/tags',
    REPORT: (id) => `/services/${id}/report`,
    FAQ: (id) => `/services/${id}/faq`,
    RELATED: (id) => `/services/${id}/related`,
  },
  
  // 响应相关
  RESPONSE: {
    BASE: '/responses',
    BY_ID: (id) => `/responses/${id}`,
    DEMAND_RESPONSES: (demandId) => `/responses/demand/${demandId}`,
    USER_RESPONSES: (userId) => `/responses/user/${userId}`,
    USER_DEMAND_RESPONSE: (demandId, userId) => `/responses/demand/${demandId}/user/${userId}`,
    ACCEPT: (id) => `/responses/${id}/accept`,
    REJECT: (id) => `/responses/${id}/reject`,
    COMPLETE: (id) => `/responses/${id}/complete`,
    CANCEL: (id) => `/responses/${id}/cancel`,
    STATS: (id) => `/responses/${id}/stats`,
    REVIEW: (id) => `/responses/${id}/review`,
    REVIEWS: (id) => `/responses/${id}/reviews`,
    REPORT: (id) => `/responses/${id}/report`,
    STATUS_HISTORY: (id) => `/responses/${id}/status-history`,
    MESSAGES: (id) => `/responses/${id}/messages`,
    FILES: (id) => `/responses/${id}/files`,
    FILE_BY_ID: (responseId, fileId) => `/responses/${responseId}/files/${fileId}`,
    TEMPLATES: '/responses/templates',
    USE_TEMPLATE: (templateId) => `/responses/templates/${templateId}/use`,
  },
  
  // 需求相关
  DEMAND: {
    BASE: '/demands',
    BY_ID: (id) => `/demands/${id}`,
    SEARCH: '/demands/search',
    RECOMMENDED: '/demands/recommended',
    HOT: '/demands/hot',
    USER_DEMANDS: (userId) => `/demands/user/${userId}`,
    USER_RESPONDED_DEMANDS: (userId) => `/demands/user/${userId}/responded`,
    FAVORITE: (id) => `/demands/${id}/favorite`,
    FAVORITES: '/demands/favorites',
    STATS: (id) => `/demands/${id}/stats`,
    STATUS: (id) => `/demands/${id}/status`,
    STATUS_HISTORY: (id) => `/demands/${id}/status-history`,
    MESSAGES: (id) => `/demands/${id}/messages`,
    FILES: (id) => `/demands/${id}/files`,
    FILE_BY_ID: (demandId, fileId) => `/demands/${demandId}/files/${fileId}`,
    CATEGORIES: '/demands/categories',
    TYPES: '/demands/types',
    TAGS: '/demands/tags',
    REPORT: (id) => `/demands/${id}/report`,
    FAQ: (id) => `/demands/${id}/faq`,
    RELATED: (id) => `/demands/${id}/related`,
    TEMPLATES: '/demands/templates',
    USE_TEMPLATE: (templateId) => `/demands/templates/${templateId}/use`,
    OVERVIEW: '/demands/overview',
    TRENDS: '/demands/trends',
  },
};

// API响应格式
export const API_RESPONSE_FORMAT = {
  SUCCESS: {
    code: 200,
    message: 'success',
    data: null,
  },
  ERROR: {
    code: 500,
    message: 'error',
    data: null,
  },
};

// API错误消息
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  TIMEOUT_ERROR: '请求超时，请稍后重试',
  UNAUTHORIZED: '登录已过期，请重新登录',
  FORBIDDEN: '没有权限访问该资源',
  NOT_FOUND: '请求的资源不存在',
  VALIDATION_ERROR: '请求参数错误',
  SERVER_ERROR: '服务器内部错误，请稍后重试',
  UNKNOWN_ERROR: '未知错误，请稍后重试',
};

// 导出默认配置
export default {
  ...API_CONFIG,
  endpoints: API_ENDPOINTS,
  responseFormat: API_RESPONSE_FORMAT,
  errorMessages: API_ERROR_MESSAGES,
};