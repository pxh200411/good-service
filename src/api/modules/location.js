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
  //console.log('搜索关键词:', keyword);
  
  // 使用原生fetch API来完全控制URL格式
  const baseURL = process.env.NODE_ENV === 'development' 
    ? "http://10.29.127.241:8080/api" 
    : "/api";
  
  const url = `${baseURL}/locations/search?keyword=${keyword}`;
  //console.log('完整请求URL:', url);
  
  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  });
};

/**
 * 根据位置ID获取位置信息
 * @param {number} locationId - 位置ID
 * @returns {Promise} 位置信息
 */
export const getLocationById = (locationId) => {
  return request({
    url: `/locations/location/${locationId}`,
    method: 'get',
  });
};