import request from '../../utils/axios';

/**
 * 需求相关API接口
 * 基于实际后端接口规范
 */

/**
 * 发布需求
 * @param {number} userId - 用户ID
 * @param {Object} demandData - 需求数据
 * @param {number} demandData.locationId - 位置ID
 * @param {number} demandData.serviceId - 服务ID
 * @param {string} demandData.title - 需求标题
 * @param {string} demandData.description - 需求描述
 * @param {Object} demandData.startTime - 开始时间
 * @param {Object} demandData.endTime - 结束时间
 * @returns {Promise} 发布结果
 */
export const publishDemand = (userId, demandData) => {
  return request({
    url: `/demands/${userId}`,
    method: 'post',
    data: demandData,
  });
};

/**
 * 获取我的需求列表（非分页）
 * @param {number} userId - 用户ID
 * @returns {Promise} 我的需求列表
 */
export const getMyDemands = (userId) => {
  return request({
    url: `/demands/my-demands/${userId}`,
    method: 'get',
  });
};

/**
 * 获取我的需求分页列表
 * @param {number} userId - 用户ID
 * @returns {Promise} 分页的需求列表
 */
export const getMyDemandsPaged = (userId) => {
  return request({
    url: `/demands/my-demands/${userId}/paged`,
    method: 'get',
  });
};

/**
 * 查询单个需求
 * @param {number} demandId - 需求ID
 * @returns {Promise} 需求详情
 */
export const getDemandById = (demandId) => {
  return request({
    url: `/demands/${demandId}`,
    method: 'get',
  });
};

/**
 * 修改需求（非空属性）
 * @param {number} demandId - 需求ID
 * @param {Object} demandData - 需求数据
 * @param {number} demandData.locationId - 位置ID
 * @param {number} demandData.serviceId - 服务ID
 * @param {string} demandData.title - 需求标题
 * @param {string} demandData.description - 需求描述
 * @param {Object} demandData.startTime - 开始时间
 * @param {Object} demandData.endTime - 结束时间
 * @returns {Promise} 修改结果
 */
export const updateDemand = (demandId, demandData) => {
  return request({
    url: `/demands/${demandId}`,
    method: 'patch',
    data: demandData,
  });
};

/**
 * 替换需求（完整替换）
 * @param {number} demandId - 需求ID
 * @param {Object} demandData - 需求数据
 * @param {number} demandData.locationId - 位置ID
 * @param {number} demandData.serviceId - 服务ID
 * @param {string} demandData.title - 需求标题
 * @param {string} demandData.description - 需求描述
 * @param {Object} demandData.startTime - 开始时间
 * @param {Object} demandData.endTime - 结束时间
 * @returns {Promise} 替换结果
 */
export const replaceDemand = (demandId, demandData) => {
  return request({
    url: `/demands/${demandId}`,
    method: 'put',
    data: demandData,
  });
};

/**
 * 删除需求
 * @param {number} demandId - 需求ID
 * @returns {Promise} 删除结果
 */
export const deleteDemand = (demandId) => {
  return request({
    url: `/demands/${demandId}`,
    method: 'delete',
  });
};

/**
 * 按服务搜索需求
 * @param {Array<string>} serviceNames - 服务名称数组
 * @returns {Promise} 分页的需求列表
 */
export const searchByService = (serviceNames) => {
  return request({
    url: '/demands/by-service',
    method: 'get',
    params: { serviceNames },
  });
};

/**
 * 按位置和时间搜索需求
 * @param {Object} params - 搜索参数
 * @param {number} params.seconds - 时间戳秒数
 * @param {number} params.nanos - 纳秒数
 * @param {Array<number>} params.locationIds - 位置ID数组
 * @returns {Promise} 分页的需求列表
 */
export const searchByLocationAndTime = (params) => {
  return request({
    url: '/demands/by-location-time',
    method: 'get',
    params,
  });
};

/**
 * 获取所有需求（非分页）
 * @returns {Promise} 所有需求列表
 */
export const getAllDemands = () => {
  return request({
    url: '/demands/all',
    method: 'get',
  });
};

/**
 * 获取所有需求分页列表
 * @returns {Promise} 分页的所有需求列表
 */
export const getAllDemandsPaged = () => {
  return request({
    url: '/demands/all/paged',
    method: 'get',
  });
};

/**
 * 获取所有需求（带用户优先级）
 * @param {number} prioritizedUserId - 优先用户ID
 * @returns {Promise} 需求列表
 */
export const getAllDemandsWithUserPriority = (prioritizedUserId) => {
  return request({
    url: `/demands/all/${prioritizedUserId}`,
    method: 'get',
  });
};

/**
 * 获取所有需求分页列表（带用户优先级）
 * @param {number} prioritizedUserId - 优先用户ID
 * @returns {Promise} 分页的需求列表
 */
export const getAllDemandsWithUserPriorityPaged = (prioritizedUserId) => {
  return request({
    url: `/demands/all/paged/${prioritizedUserId}`,
    method: 'get',
  });
};