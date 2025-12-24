import request from '../../utils/axios';

/**
 * 需求文件上传相关API接口
 * 基于实际后端接口规范
 */

/**
 * 为指定需求上传附件
 * @param {number} demandId - 需求ID
 * @param {File} file - 要上传的文件
 * @returns {Promise} 上传结果，包含文件信息
 */
export const uploadDemandFile = (demandId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return request({
    url: `/api/demands/${demandId}/file`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * 替换需求的附件文件
 * @param {number} demandId - 需求ID
 * @param {File} file - 要上传的新文件
 * @returns {Promise} 上传结果，包含文件信息
 */
export const replaceDemandFile = (demandId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return request({
    url: `/api/demands/${demandId}/file`,
    method: 'put',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * 获取需求的最新附件文件
 * @param {number} demandId - 需求ID
 * @param {boolean} download - 是否下载文件
 * @returns {Promise} 文件信息或文件流
 */
export const getLatestDemandFile = (demandId, download = false) => {
  return request({
    url: `/api/demands/${demandId}/file/resource`,
    method: 'get',
    params: { download },
    responseType: download ? 'blob' : 'json',
  });
};

/**
 * 删除需求的附件文件
 * @param {number} demandId - 需求ID
 * @returns {Promise} 删除结果
 */
export const deleteDemandFile = (demandId) => {
  return request({
    url: `/api/demands/${demandId}/file`,
    method: 'delete',
  });
};

/**
 * 获取需求的所有附件文件列表
 * @param {number} demandId - 需求ID
 * @returns {Promise} 文件列表
 */
export const getDemandFileList = (demandId) => {
  return request({
    url: `/api/demands/${demandId}/files`,
    method: 'get',
  });
};

/**
 * 批量下载需求附件
 * @param {number} demandId - 需求ID
 * @param {Array<number>} fileIds - 要下载的文件ID数组
 * @returns {Promise} 文件流数组
 */
export const downloadDemandFiles = (demandId, fileIds) => {
  const downloadPromises = fileIds.map(fileId => 
    getLatestDemandFile(demandId, true)
  );
  return Promise.all(downloadPromises);
};

/**
 * 获取需求文件下载URL
 * @param {number} demandId - 需求ID
 * @returns {string} 文件下载URL
 */
export const getDemandFileDownloadUrl = (demandId) => {
  return `${process.env.VITE_API_BASE_URL || ''}/api/demands/${demandId}/file/resource?download=true`;
};

/**
 * 检查需求是否有附件
 * @param {number} demandId - 需求ID
 * @returns {Promise} 检查结果
 */
export const checkDemandHasFile = (demandId) => {
  return request({
    url: `/api/demands/${demandId}/file/exists`,
    method: 'get',
  });
};