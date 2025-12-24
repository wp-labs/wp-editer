import { normalizeError } from '@seed-fe/request';

const defaultRequestConfig = {
  // 与后端 Actix 服务保持一致，使用 /api 作为统一前缀
  baseURL: '/api',
  timeout: 10000,
  // 应用相同的错误处理和拦截器
  errorConfig: {
    // errorHandler: defaultErrorHandler
  },
  interceptors: {
    request: {
      onConfig: (config) => {
        // 可以在这里添加通用请求头
        config.headers = config.headers || {};
        return config;
      },
      onError: (error) => {
        console.error('请求拦截器错误:', error);
        return normalizeError(error);
      },
    },
    response: {
      onConfig: (response) => {
        // 可以在这里对响应数据进行通用处理
        return response;
      },
      onError: (error) => {
        // 仅处理未认证，其它异常由全局异常模块处理
        // TODO: 处理未认证的逻辑
        return normalizeError(error);
      },
    },
  },
};

export default defaultRequestConfig;
