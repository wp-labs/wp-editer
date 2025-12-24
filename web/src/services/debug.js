/**
 * 调试服务模块
 * 提供日志解析、记录转换、知识库状态查询和性能测试功能
 */

import httpRequest from './request';

/**
 * 解析日志
 * @param {Object} options - 解析选项
 * @param {string} options.logs - 日志内容
 * @param {string} options.rules - 解析规则
 * @param {number} [options.connectionId] - 连接 ID（可选）
 * @returns {Promise<Object>} 解析结果
 */
export async function parseLogs(options) {
  const { logs, rules, connectionId } = options;

  // 调用后端解析接口：POST /api/debug/parse
  const response = await httpRequest.post('/debug/parse', {
    connection_id: connectionId,
    rules,
    logs,
  });

  // 后端直接返回字段数组，包装为统一格式
  return {
    success: true,
    fields: Array.isArray(response) ? response : [],
  };
}

/**
 * 转换记录格式
 * @param {Object} options - 转换选项
 * @param {string} options.oml - OML 配置
 * @param {number} [options.connectionId] - 连接 ID（可选）
 * @returns {Promise<Object>} 转换结果
 */
export async function convertRecord(options) {
  const { oml, connectionId } = options;

  // 调用后端转换接口：POST /api/debug/transform
  // parse_result 参数保留但后端实际使用 SharedRecord
  const response = await httpRequest.post('/debug/transform', {
    connection_id: connectionId,
    parse_result: {}, // 占位，后端使用 SharedRecord
    oml,
  });

  // 兼容后端直接返回或包一层 data 的情况
  const data = response && typeof response === 'object' && 'data' in response
    ? response.data
    : response;

  // 如果后端返回 success:false，视为业务错误，抛出供调用方捕获
  if (data && data.success === false) {
    const errorMessage = data.error?.message || '执行转换失败，请稍后重试';
    const error = new Error(errorMessage);
    if (data.error?.code) {
      // 将后端错误码附加到错误对象，方便调用方按需处理
      error.code = data.error.code;
    }
    throw error;
  }

  // 后端返回 DebugTransformResponse 结构，包含 fields 和 format_json
  const payload = data;

  return {
    fields: Array.isArray(payload?.fields) ? payload.fields : [],
    // 提供给前端 JSON 模式直接展示的标准 JSON 字符串
    formatJson: typeof payload?.format_json === 'string' ? payload.format_json : '',
  };
}

/**
 * 运行性能测试
 * @param {Object} options - 测试选项
 * @param {string} options.testType - 测试类型
 * @param {Object} options.config - 测试配置
 * @returns {Promise<Object>} 测试任务信息
 */
export async function runPerformanceTest(options) {
  const { testType, config } = options;
  
  // 调用后端性能测试接口：POST /api/debug/performance/run
  const response = await httpRequest.post('/debug/performance/run', {
    test_type: testType,
    config,
  });
  
  // 后端返回测试任务信息
  return response || {
    taskId: `perf-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`,
    status: 'running',
  };
}
