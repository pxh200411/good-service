import request from '../../utils/axios';

/**
 * 响应相关API接口
 * 基于实际后端接口规范
 */

/**
 * 提交响应
 * @param {Object} responseData - 响应数据
 * @param {number} responseData.demandId - 需求ID
 * @param {string} responseData.title - 响应标题
 * @param {string} responseData.description - 响应描述
 * @returns {Promise} 提交结果
 */
export const submitResponse = (responseData) => {
  return request({
    url: '/responses',
    method: 'post',
    data: responseData,
  });
};

/**
 * 查询用户提交的响应列表（非分页）
 * @returns {Promise} 用户提交的响应列表
 */
export const getMyResponses = () => {
  return request({
    url: '/responses/my-responses',
    method: 'get',
  });
};

/**
 * 查询用户提交的响应分页列表
 * @param {Object} params - 分页参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @returns {Promise} 分页的响应列表
 */
export const getMyResponsesPaged = (params) => {
  return request({
    url: '/responses/my-responses/paged',
    method: 'get',
    params,
  });
};

/**
 * 查询用户接收的响应列表（非分页）
 * @returns {Promise} 用户接收的响应列表
 */
export const getReceivedResponses = () => {
  return request({
    url: '/responses/received',
    method: 'get',
  });
};

/**
 * 查询特定需求收到的响应列表
 * @param {number} demandId - 需求ID
 * @returns {Promise<Array>} 响应列表，包含ResponseVo对象数组
 * @description 根据需求ID获取该需求收到的所有响应
 * ResponseVo包含：id, demandId, userId, title, description, status, createdAt, modifiedAt
 */
export const getReceivedResponsesByDemandId = (demandId) => {
  return request({
    url: `/responses/received/demands/${demandId}`,
    method: 'get',
  });
};

/**
 * 查询用户接收的响应分页列表
 * @param {Object} params - 分页参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @returns {Promise} 分页的接收响应列表
 */
export const getReceivedResponsesPaged = (params) => {
  return request({
    url: '/responses/received/paged',
    method: 'get',
    params,
  });
};

/**
 * 查询单个响应
 * @param {number} responseId - 响应ID
 * @returns {Promise} 响应详情
 */
export const getResponseById = (responseId) => {
  return request({
    url: `/responses/${responseId}`,
    method: 'get',
  });
};

/**
 * 修改响应（完整替换）
 * @param {number} responseId - 响应ID
 * @param {Object} responseData - 响应数据
 * @param {number} responseData.demandId - 需求ID
 * @param {string} responseData.title - 响应标题
 * @param {string} responseData.description - 响应描述
 * @returns {Promise} 修改结果
 */
export const updateResponse = (responseId, responseData) => {
  return request({
    url: `/responses/${responseId}`,
    method: 'put',
    data: responseData,
  });
};

/**
 * 删除响应
 * @param {number} responseId - 响应ID
 * @returns {Promise} 删除结果
 */
export const deleteResponse = (responseId) => {
  return request({
    url: `/responses/${responseId}`,
    method: 'delete',
  });
};

/**
 * 接受响应
 * @param {number} responseId - 响应ID
 * @returns {Promise} 接受结果
 */
export const acceptResponse = (responseId) => {
  return request({
    url: `/responses/${responseId}/accept`,
    method: 'post',
  });
};

/**
 * 拒绝响应
 * @param {number} responseId - 响应ID
 * @returns {Promise} 拒绝结果
 */
export const rejectResponse = (responseId) => {
  return request({
    url: `/responses/${responseId}/reject`,
    method: 'post',
  });
};

/**
 * 标记响应为完成
 * @param {number} responseId - 响应ID
 * @returns {Promise} 标记完成结果
 */
export const resolveResponse = (responseId) => {
  return request({
    url: `/responses/${responseId}/resolve`,
    method: 'post',
  });
};