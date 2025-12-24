import { normalizeError } from '@seed-fe/request';
// import { defaultErrorHandler } from '../error-handler';

const gitlabRequestConfig = {
  instanceName: 'Gitlab',
  baseURL: 'https://gitlab.com/api/v4',
  timeout: 10000,
  // 应用相同的错误处理和拦截器
  errorConfig: {
    // errorHandler: defaultErrorHandler
  },
  interceptors: {
    request: {
      onConfig: (config) => {
        // 可以在这里添加通用请求头
        config.headers['PRIVATE-TOKEN'] ??= import.meta.env.VITE_GITLAB_TOKEN;
        return config;
      },
      onError: (error) => {
        return normalizeError(error);
      },
    },
    response: {
      onConfig: (response) => {
        // 可以在这里对响应数据进行通用处理
        return response;
      },
      onError: (error) => {
        return normalizeError(error);
      },
    },
  },
};

export default gitlabRequestConfig;
