import request from '../../utils/axios';

/**
 * 位置相关API接口
 * 基于实际后端接口规范
 */

/**
 * 获取省份列表
 * @returns {Promise} 省份列表
 */
export const getProvinces = () => {
  return request({
    url: '/locations/provinces',
    method: 'get',
  });
};

/**
 * 获取城市列表
 * @param {string} provinceId - 省份ID
 * @returns {Promise} 城市列表
 */
export const getCities = (provinceId) => {
  return request({
    url: `/locations/cities/${provinceId}`,
    method: 'get',
  });
};

/**
 * 获取区县/项目列表
 * @param {string} cityId - 城市ID
 * @returns {Promise} 区县/项目列表
 */
export const getItems = (cityId) => {
  return request({
    url: `/locations/items/${cityId}`,
    method: 'get',
  });
};

/**
 * 搜索位置
 * @param {string} keyword - 搜索关键词
 * @returns {Promise} 搜索结果
 */
export const searchLocations = (keyword) => {
  return request({
    url: '/locations/search',
    method: 'get',
    params: { keyword },
  });
};