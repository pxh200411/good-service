import request from '../../utils/axios';

/**
 * 认证相关API接口
 * 基于实际后端接口规范
 */

/**
 * 用户登录
 * @param {Object} credentials - 登录凭证
 * @param {string} credentials.username - 用户名
 * @param {string} credentials.password - 密码
 * @returns {Promise} 登录结果
 */
export const login = (credentials) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data: credentials,
  });
};

/**
 * 用户注册
 * @param {Object} userData - 用户注册信息
 * @param {string} userData.username - 用户名
 * @param {string} userData.password - 密码
 * @returns {Promise} 注册结果
 */
export const register = (userData) => {
  return request({
    url: '/auth/register',
    method: 'post',
    data: userData,
  });
};

/**
 * 管理员注册
 * @param {Object} adminData - 管理员注册信息
 * @param {string} adminData.username - 用户名
 * @param {string} adminData.password - 密码
 * @returns {Promise} 注册结果
 */
export const registerAdmin = (adminData) => {
  return request({
    url: '/auth/register-admin',
    method: 'post',
    data: adminData,
  });
};