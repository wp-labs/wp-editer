import httpRequest, { defineRequestConfig, getRequestInstance } from '@seed-fe/request';
import defaultRequestConfig from '../configs/request-default';
import gitlabRequestConfig from '../configs/request-gitlab';

/**
 * Gitlab 请求实例
 */
let gitlabRequest;

/**
 * 注册请求配置
 */
export function configureRequest() {
  // 注册全局默认实例
  defineRequestConfig(defaultRequestConfig);

  // 注册 Gitlab 实例
  defineRequestConfig(gitlabRequestConfig);

  gitlabRequest = getRequestInstance('Gitlab');
}

// 导出默认实例
export default httpRequest;

// 导出 Gitlab 实例
export { gitlabRequest };
