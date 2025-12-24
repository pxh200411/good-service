import request from '../../utils/axios';

/**
 * 用户相关API接口
 * 基于实际后端接口规范
 */

/**
 * 获取用户详情
 * @param {string} username - 用户名
 * @returns {Promise} 用户详情
 */
export const getUserByUsername = (username) => {
  return request({
    url: `/users/${username}`,
    method: 'get',
  });
};

/**
 * 获取客户用户列表
 * @returns {Promise} 客户用户列表
 */
export const getCustomerList = () => {
  return request({
    url: '/users/list/customers',
    method: 'get',
  });
};

/**
 * 获取所有用户列表
 * @returns {Promise} 所有用户列表
 */
export const getAllUsers = () => {
  return request({
    url: '/users/list/all',
    method: 'get',
  });
};

/**
 * 检查用户名是否存在
 * @param {string} username - 用户名
 * @returns {Promise} 检查结果
 */
export const checkUserExists = (username) => {
  return request({
    url: `/users/exists/${username}`,
    method: 'get',
  });
};

/**
 * 更新用户信息 (PUT方式)
 * @param {string} username - 用户名
 * @param {Object} userData - 更新的用户数据
 * @param {string} userData.realName - 真实姓名
 * @param {string} userData.phone - 手机号
 * @param {string} userData.biography - 个人简介
 * @returns {Promise} 更新结果
 */
export const updateUserByPut = (username, userData) => {
  return request({
    url: `/users/${username}`,
    method: 'put',
    data: userData,
  });
};

/**
 * 更新用户信息 (PATCH方式)
 * @param {string} username - 用户名
 * @param {Object} userData - 更新的用户数据
 * @param {string} userData.realName - 真实姓名
 * @param {string} userData.phone - 手机号
 * @param {string} userData.biography - 个人简介
 * @returns {Promise} 更新结果
 */
export const updateUserByPatch = (username, userData) => {
  return request({
    url: `/users/${username}`,
    method: 'patch',
    data: userData,
  });
};

/**
 * 更新用户密码
 * @param {string} username - 用户名
 * @param {Object} passwordData - 密码数据
 * @param {string} passwordData.oldPassword - 旧密码
 * @param {string} passwordData.newPassword - 新密码
 * @returns {Promise} 更新结果
 */
export const updateUserPassword = (username, passwordData) => {
  return request({
    url: `/users/password/${username}`,
    method: 'put',
    data: passwordData,
  });
};