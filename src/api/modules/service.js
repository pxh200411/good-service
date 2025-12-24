import request from '../../utils/axios';

/**
 * 服务类型相关API接口
 */

/**
 * 分页获取所有服务类型
 * @param {Object} params - 分页参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} 分页的服务类型列表
 */
export const getAllServiceTypesPaged = (params) => {
  return request({
    url: '/service-types/paged',
    method: 'get',
    params,
  });
};

/**
 * 获取所有服务类型
 * @returns {Promise} 所有服务类型列表
 */
export const getAllServiceTypes = () => {
  return request({
    url: '/service-types',
    method: 'get',
  });
};

/**
 * 根据ID获取服务类型
 * @param {string} id - 服务类型ID
 * @returns {Promise} 服务类型详情
 */
export const getServiceTypeById = (id) => {
  return request({
    url: `/service-types/${id}`,
    method: 'get',
  });
};

/**
 * 创建服务类型
 * @param {Object} serviceTypeData - 服务类型数据
 * @param {string} serviceTypeData.name - 服务类型名称
 * @param {string} serviceTypeData.description - 服务类型描述
 * @param {string} serviceTypeData.category - 服务类别
 * @param {boolean} serviceTypeData.isActive - 是否激活
 * @returns {Promise} 创建结果
 */
export const createServiceType = (serviceTypeData) => {
  return request({
    url: '/service-types',
    method: 'post',
    data: serviceTypeData,
  });
};