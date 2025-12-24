/**
 * API接口统一导出文件
 * 集中管理所有API接口，方便统一调用
 */

// 认证相关API
export * from './modules/auth';

// 用户相关API
export * from './modules/user';

// 位置相关API
export * from './modules/location';

// 服务相关API
export * from './modules/service';

// 响应相关API
export * from './modules/response';

// 需求相关API
export * from './modules/demand';

// 文件上传相关API
export * from './modules/file';

// 需求文件上传相关API
export * from './modules/demandFile';

// 导入所有API模块
import * as authAPI from './modules/auth';
import * as userAPI from './modules/user';
import * as locationAPI from './modules/location';
import * as serviceAPI from './modules/service';
import * as responseAPI from './modules/response';
import * as demandAPI from './modules/demand';
import * as fileAPI from './modules/file';
import * as demandFileAPI from './modules/demandFile';

// 统一API对象
const API = {
  auth: authAPI,
  user: userAPI,
  location: locationAPI,
  service: serviceAPI,
  response: responseAPI,
  demand: demandAPI,
  file: fileAPI,
  demandFile: demandFileAPI,
};

export default API;