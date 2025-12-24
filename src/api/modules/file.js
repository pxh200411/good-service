import request from '../../utils/axios';

/**
 * 文件上传相关API接口
 * 基于实际后端接口规范
 */

/**
 * 通用文件上传
 * @param {File} file - 要上传的文件
 * @param {number} uploaderId - 上传者ID（可选）
 * @returns {Promise} 上传结果，包含文件信息
 */
export const uploadFile = (file, uploaderId) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return request({
    url: '/api/files',
    method: 'post',
    data: formData,
    params: uploaderId ? { uploaderId } : undefined,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * 获取文件信息
 * @param {number} fileId - 文件ID
 * @param {boolean} download - 是否下载文件
 * @returns {Promise} 文件信息或文件流
 */
export const getFile = (fileId, download = false) => {
  return request({
    url: `/api/files/${fileId}`,
    method: 'get',
    params: { download },
    responseType: download ? 'blob' : 'json',
  });
};

/**
 * 删除文件
 * @param {number} fileId - 文件ID
 * @returns {Promise} 删除结果
 */
export const deleteFile = (fileId) => {
  return request({
    url: `/api/files/${fileId}`,
    method: 'delete',
  });
};

/**
 * 获取文件列表
 * @param {Object} params - 查询参数
 * @param {number} params.uploaderId - 上传者ID（可选）
 * @param {string} params.fileName - 文件名关键词（可选）
 * @param {string} params.startDate - 开始日期（可选）
 * @param {string} params.endDate - 结束日期（可选）
 * @returns {Promise} 文件列表
 */
export const getFileList = (params = {}) => {
  return request({
    url: '/api/files/list',
    method: 'get',
    params,
  });
};

/**
 * 批量上传文件
 * @param {Array<File>} files - 要上传的文件数组
 * @param {number} uploaderId - 上传者ID（可选）
 * @returns {Promise} 上传结果数组
 */
export const uploadMultipleFiles = (files, uploaderId) => {
  const uploadPromises = files.map(file => uploadFile(file, uploaderId));
  return Promise.all(uploadPromises);
};

/**
 * 获取文件下载URL
 * @param {number} fileId - 文件ID
 * @returns {string} 文件下载URL
 */
export const getFileDownloadUrl = (fileId) => {
  return `${process.env.VITE_API_BASE_URL || ''}/api/files/${fileId}?download=true`;
};