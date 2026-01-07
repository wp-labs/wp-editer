import { Table, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { convertRecord, fetchDebugExamples, parseLogs, wplCodeFormat, omlCodeFormat, base64Decode } from '@/services/debug';
import CodeJarEditor from '@/views/components/CodeJarEditor';

/**
 * 从新格式的 value 中提取实际值
 * @param {Object} value - 值对象 { "IpAddr": "...", "Chars": "...", "Ignore": {} }
 * @returns {string} 提取的字符串值
 */
const extractFieldValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) {
      return '';
    }
    const firstKey = keys[0];
    const firstValue = value[firstKey];
    if (typeof firstValue === 'object' && firstValue !== null) {
      return JSON.stringify(firstValue);
    }
    return String(firstValue);
  }
  return String(value);
};

/**
 * 兼容新旧格式的字段列表
 * 新格式: { fields: { items: [...] } }
 * 旧格式: { fields: [...] }
 * @param {Object} response - API 响应
 * @returns {Array} 字段数组
 */
const getFieldsFromResponse = (response) => {
  if (!response || !response.fields) {
    return [];
  }
  if (Array.isArray(response.fields)) {
    return response.fields;
  }
  if (Array.isArray(response.fields.items)) {
    return response.fields.items;
  }
  return [];
};

/**
 * 从转换页的解析结果中获取字段数组
 * 转换页的 transformParseResult 格式为 { fields: { items: [...] } }
 * @param {Object} transformParseResult - 转换页的解析结果
 * @returns {Array} 字段数组
 */
const getFieldsFromTransformParseResult = (data) => {
  if (!data || !data.fields) {
    return [];
  }
  if (Array.isArray(data.fields)) {
    return data.fields;
  }
  if (Array.isArray(data.fields.items)) {
    return data.fields.items;
  }
  return [];
};

// 默认示例列表，保存在前端，便于无网络或后端无数据时直接展示
const DEFAULT_EXAMPLES = [
  {
    name: 'nginx',
    wpl_code:
      'package /nginx/ {\n    rule nginx {\n        (\n            ip:sip,_^2,chars:timestamp<[,]>,http/request",chars:status,chars:size,chars:referer",http/agent",_"\n        )\n    }\n}\n',
    oml_code: '',
    sample_data:
      '180.57.30.148 - - [21/Jan/2025:01:40:02 +0800] "GET /nginx-logo.png HTTP/1.1" 500 368 "<http://207.131.38.110/>" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36" "-"',
  },
];

function SimulateDebugPage() {
  const [activeKey, setActiveKey] = useState('parse');
  const [inputValue, setInputValue] = useState('');
  const [ruleValue, setRuleValue] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  // 解析页“显示空值”开关
  const [showEmpty, setShowEmpty] = useState(true);

  // 解析错误状态
  const [parseError, setParseError] = useState(null);

  // 转换相关状态
  const [transformOml, setTransformOml] = useState('');
  const [transformParseResult, setTransformParseResult] = useState(null);
  const [transformResult, setTransformResult] = useState(null);
  const [transformParseViewMode, setTransformParseViewMode] = useState('table');
  const [transformResultViewMode, setTransformResultViewMode] = useState('table');
  // 转换页"显示空值"开关（转换结果）
  const [transformResultShowEmpty, setTransformResultShowEmpty] = useState(true);
  // 转换页"显示空值"开关（解析结果）
  const [transformParseShowEmpty, setTransformParseShowEmpty] = useState(true);
  // 转换错误状态
  const [transformError, setTransformError] = useState(null);
  // 示例列表状态
  const [examples, setExamples] = useState(DEFAULT_EXAMPLES);
  const examplesOpen = true;
  const [examplesLoading, setExamplesLoading] = useState(false);
  const [examplesLoaded, setExamplesLoaded] = useState(false);
  const examplesFetchedRef = useRef(false); // 防止严格模式导致的重复请求

  /**
   * 处理测试/解析按钮点击
   * 调用服务层解析日志
   */
  const handleTest = async () => {
    setLoading(true);
    setParseError(null); // 重置错误状态
    try {
      // 调用服务层解析日志（使用对象参数）
      const response = await parseLogs({
        logs: inputValue,
        rules: ruleValue,
      });
      setResult(response);
      // 同步更新转换页的解析结果
      const fields = getFieldsFromResponse(response);
      if (fields.length > 0) {
        console.log('转换页解析结果:', fields);
        setTransformParseResult({ fields: { items: fields } });
      }
    } catch (error) {
      setParseError(error); // 将错误存储到状态中
    } finally {
      setLoading(false);
    }
  };

  /**
   * 展示示例列表，按需拉取数据（默认展开，不再折叠）
   */
  const handleToggleExamples = async () => {
    if (examplesLoading || examplesLoaded || examplesFetchedRef.current) {
      return;
    }
    examplesFetchedRef.current = true;
    // 拉取示例列表，供用户选择
    setExamplesLoading(true);
    try {
      const data = await fetchDebugExamples();
      const list = data && typeof data === 'object' ? Object.values(data) : [];
      if (Array.isArray(list) && list.length > 0) {
        setExamples(list);
        setExamplesLoaded(true);
      } else if (!examplesLoaded && (!list || list.length === 0)) {
        message.info('暂无可用示例，已展示默认示例');
      }
    } catch (error) {
      message.error(`获取示例失败：${error?.message || error}`);
    } finally {
      setExamplesLoading(false);
    }
  };

  const wplFormat = async () => {
    try {
      const response = await wplCodeFormat(ruleValue);
      console.log('格式化WPL代码响应:', response);
      setRuleValue(response?.wpl_code || '');
    } catch (error) {
      message.error(`格式化WPL代码失败：${error?.message || error}`);
    }
  };

  // 页面加载后默认展开示例并尝试拉取
  useEffect(() => {
    handleToggleExamples();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 应用某个示例到日志、规则与 OML 输入区域，并自动尝试解析
   */
  const handleApplyExample = async (exampleItem) => {
    if (!exampleItem) return;
    const { sample_data: sampleData, wpl_code: wplCode, oml_code: omlCode } = exampleItem;
    setInputValue(sampleData || '');
    setRuleValue(wplCode || '');
    setTransformOml(omlCode || '');

    if (!sampleData || !wplCode) {
      return;
    }

    setLoading(true);
    setParseError(null);
    try {
      const response = await parseLogs({
        logs: sampleData,
        rules: wplCode,
      });
      setResult(response);
      const fields = getFieldsFromResponse(response);
      if (fields.length > 0) {
        setTransformParseResult({ fields: { items: fields } });
      }
    } catch (error) {
      setParseError(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 一键清空
   * 清空解析和转换的所有输入和结果
   */
  const handleClear = () => {
    // 清空解析页面
    setInputValue('');
    setRuleValue('');
    setResult(null);
    setParseError(null); // 清空解析错误
    // 清空转换页面
    setTransformOml('');
    setTransformParseResult(null);
    setTransformResult(null);
    setTransformError(null); // 清空转换错误
  };

  // 处理 Base64 解码按钮点击
  const handleBase64Decode = async () => {
    try {
      const response = await base64Decode(inputValue);
      console.log('Base64解码响应:', response);
      setInputValue(response || '');
    } catch (error) {
      message.error(`Base64解码失败：${error?.message || error}`);
    }
  };

  const handleTransform = async () => {
    if (!transformOml) {
      message.warning('请先填写 OML 转换规则');
      return;
    }
    setLoading(true);
    setTransformError(null); // 重置转换错误状态
    try {
      console.log('转换页解析结果:', transformParseResult);
      const response = await convertRecord({ oml: transformOml, parseResult: transformParseResult });
      setTransformResult(response);
      setTransformError(null);
    } catch (error) {
      message.error(`执行转换失败：${error?.message || error}`);
      setTransformError(error);
      setTransformResult(null);
    } finally {
      setLoading(false);
    }
  };


  const omlFormat = async () => {
    try {
      const response = await omlCodeFormat(transformOml);
      setTransformOml(response?.oml_code || '');
    } catch (error) {
      message.error(`格式化OML代码失败：${error?.message || error}`);
    }
  };

  const menuItems = [
    { key: 'parse', label: '解析' },
    { key: 'convert', label: '转换' },
  ];

  const resultColumns = [
    { title: 'no', dataIndex: 'no', key: 'no', width: 60, render: (val) => val ?? '-' },
    { title: 'meta', dataIndex: 'meta', key: 'meta', width: 120, render: (val) => val ?? '-' },
    { title: 'name', dataIndex: 'name', key: 'name', width: 150, render: (val) => val ?? '-' },
    {
      title: 'value',
      dataIndex: 'value',
      key: 'value',
      style: { wordWrap: 'break-word', wordBreak: 'break-all', maxWidth: 300 },
      render: (val) => extractFieldValue(val),
    },
  ];

  /**
   * 按"显示空值"开关过滤字段列表
   * showEmptyFlag=false 时，过滤掉 value 为空的对象
   */
  const filterFieldsByShowEmpty = (fields, showEmptyFlag) => {
    const list = Array.isArray(fields) ? fields : [];
    if (showEmptyFlag) {
      return list;
    }
    return list.filter(fieldItem => {
      if (!fieldItem || typeof fieldItem !== 'object') {
        return false;
      }
      const fieldValue = extractFieldValue(fieldItem.value);
      return fieldValue !== '';
    });
  };

  // 统一渲染解析错误内容，仅保留错误标题和错误码提示
  const renderParseError = () => {
    if (!parseError) return null;

    return (
      <div
        style={{
          padding: '20px',
          backgroundColor: '#fff1f0',
          border: '1px solid #ffccc7',
          borderRadius: 4,
          margin: '10px',
        }}
      >
        <h4 style={{ color: '#f5222d', marginBottom: '8px' }}>解析失败</h4>
        <p>{parseError.message || '执行解析失败，请稍后重试'}</p>
        {parseError.code && (
          <p style={{ color: '#f5222d', margin: '8px 0 0 0' }}>
            <span style={{ fontWeight: 'bold' }}>错误码：</span>
            {parseError.code}
          </p>
        )}
      </div>
    );
  };

  // 转换错误展示，仅保留错误标题与错误码
  const renderTransformError = () => {
    if (!transformError) return null;
    const errorMessage =
      transformError.message ||
      transformError.responseData?.error?.message ||
      transformError.data?.error?.message ||
      '执行转换失败，请稍后重试';

    return (
      <div
        style={{
          padding: '20px',
          backgroundColor: '#fff1f0',
          border: '1px solid #ffccc7',
          borderRadius: 4,
          margin: '10px',
        }}
      >
        <h4 style={{ color: '#f5222d', marginBottom: '8px' }}>转换失败</h4>
        <p>{errorMessage}</p>
        {transformError.code && (
          <p style={{ color: '#f5222d', margin: '8px 0 0 0' }}>
            <span style={{ fontWeight: 'bold' }}>错误码：</span>
            {transformError.code}
          </p>
        )}
      </div>
    );
  };

  // 获取页面标题（与旧版本一致）
  const getPageTitle = () => {
    const titles = {
      parse: '解析',
      convert: '转换',
    };
    return titles[activeKey] || 'Wp Editor';
  };

  return (
    <>
      <div>
        <aside className="side-nav" data-group="simulate-debug">
          <button
            type="button"
            className={`side-item ${activeKey === 'parse' ? 'is-active' : ''}`}
            onClick={() => setActiveKey('parse')}
          >
            <h2>解析</h2>
          </button>
          <button
            type="button"
            className={`side-item ${activeKey === 'convert' ? 'is-active' : ''}`}
            onClick={() => setActiveKey('convert')}
          >
            <h2>转换</h2>
          </button>

        </aside>
        <div className="example-list example-list--compact example-list--spaced">
          <div className="example-list__header">
            <div>
              <h4 className="example-list__title">规则示例库</h4>
              <p className="example-list__desc">点击示例，自动填充日志与规则</p>
            </div>
          </div>
          {examplesLoading ? (
            <div className="example-list__message">示例加载中...</div>
          ) : examples && examples.length > 0 ? (
            <div className="example-list__grid example-list__grid--small">
              {examples.map(exampleItem => (
                <button
                  key={exampleItem.name || exampleItem.key}
                  type="button"
                  className="example-list__item"
                  onClick={() => handleApplyExample(exampleItem)}
                >
                  {exampleItem.name || '未命名示例'}
                </button>
              ))}
            </div>
          ) : (
            <div className="example-list__message">暂无示例数据</div>
          )}
        </div>
      </div>
      <section className="page-panels">
        <article className="panel is-visible">
          <header className="panel-header">
            <h2>{getPageTitle()}</h2>
          </header>
          <section className="panel-body simulate-body">
            {/* 解析页面 */}
            {activeKey === 'parse' && (
              <>
                <div className="panel-block">
                  <div className="block-header">
                    <div>
                      <h3>日志数据</h3>
                      <p className="block-desc">粘贴实时采集的原始日志，支持文本与文件导入。</p>
                    </div>
                      <div className="block-actions" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            className="btn ghost"
                            onClick={handleBase64Decode}
                          >
                            base64解码
                          </button>
                          <button type="button" className="btn ghost" onClick={handleClear}>
                            一键清空
                          </button>
                        </div>
                   
                    </div>
                  </div>
                  <CodeJarEditor
                    className="code-area"
                    value={inputValue}
                    onChange={value => setInputValue(value)}
                  />
                </div>

                <div className="split-layout">
                  <div className="split-col">
                    <div className="panel-block panel-block--fill">
                      <div className="block-header">
                        <h3>解析规则</h3>
                        <div className="block-actions">
                          <button
                            type="button"
                            className="btn ghost"
                            onClick={wplFormat}
                          >
                            格式化
                          </button>
                          <button
                            type="button"
                            className="btn primary"
                            onClick={handleTest}
                            disabled={loading}
                          >
                            {loading ? '解析中...' : '解析'}
                          </button>
                        </div>
                      </div>
                      <CodeJarEditor
                        className="code-area code-area--large"
                        value={ruleValue}
                        onChange={value => setRuleValue(value)}
                      />
                    </div>
                  </div>

                  <div className="split-col">
                    <div className="panel-block panel-block--stretch panel-block--scrollable">
                      <div className="block-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <h3>解析结果</h3>
                          <div className="mode-toggle">
                            <button
                              type="button"
                              className={`toggle-btn ${viewMode === 'table' ? 'is-active' : ''}`}
                              onClick={() => setViewMode('table')}
                            >
                              表格模式
                            </button>
                            <button
                              type="button"
                              className={`toggle-btn ${viewMode === 'json' ? 'is-active' : ''}`}
                              onClick={() => setViewMode('json')}
                            >
                              JSON 模式
                            </button>
                          </div>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={showEmpty}
                            onChange={e => setShowEmpty(e.target.checked)}
                          />
                          <span className="switch-slider"></span>
                          <span className="switch-label">显示空值</span>
                        </label>
                      </div>
                      <div className={`mode-content ${viewMode === 'table' ? 'is-active' : ''}`}>
                        {parseError ? (
                          renderParseError()
                        ) : result ? (
                          <Table
                            size="small"
                            columns={resultColumns}
                            dataSource={filterFieldsByShowEmpty(result.fields, showEmpty)}
                            pagination={false}
                            rowKey="no"
                            className="data-table compact"
                            scroll={{ y: 400 }}
                          />
                        ) : (
                          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                            点击"解析"按钮查看结果
                          </div>
                        )}
                      </div>
                      <div className={`mode-content ${viewMode === 'json' ? 'is-active' : ''}`}>
                        {parseError ? (
                          renderParseError()
                        ) : result ? (
                          <pre
                            className="code-block"
                            style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                          >
                            {(() => {
                              if (result.formatJson) {
                                try {
                                  const parsed = JSON.parse(result.formatJson);
                                  return JSON.stringify(parsed, null, 2);
                                } catch (_e) {
                                  // 如果不是严格 JSON 字符串，则按原样输出
                                  return result.formatJson;
                                }
                              }
                              return JSON.stringify(
                                {
                                  ...result,
                                  fields: filterFieldsByShowEmpty(result.fields, showEmpty),
                                },
                                null,
                                2
                              );
                            })()}
                          </pre>
                        ) : (
                          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                            点击"解析"按钮查看结果
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 转换页面 */}
            {activeKey === 'convert' && (
              <div className="split-layout transform-layout">
                <div className="split-col transform-col">
                  <div className="panel-block panel-block--stretch panel-block--fill">
                    <div className="block-header">
                      <div>
                        <h3>OML 输入</h3>
                        <p className="block-desc">根据解析结果补齐转换逻辑。</p>
                      </div>
                      <div className="block-actions">
                        <button
                          type="button"
                          className="btn primary"
                          onClick={omlFormat}
                        >
                          格式化
                        </button>
                        <button
                          type="button"
                          className="btn primary"
                          onClick={handleTransform}
                          disabled={loading}
                        >
                          {loading ? '转换中...' : '转换'}
                        </button>
                        <button
                          type="button"
                          className="btn ghost"
                          onClick={() => setTransformOml('')}
                        >
                          清空
                        </button>
                      </div>
                    </div>
                    <CodeJarEditor
                      className="code-area code-area--large"
                      value={transformOml}
                      onChange={value => setTransformOml(value)}
                    />
                  </div>
                </div>
                <div className="split-col transform-col">
                  <div className="panel-block panel-block--scrollable">
                    <div className="block-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h3>解析结果</h3>
                        <div className="mode-toggle">
                          <button
                            type="button"
                            className={`toggle-btn ${transformParseViewMode === 'table' ? 'is-active' : ''
                              }`}
                            onClick={() => setTransformParseViewMode('table')}
                          >
                            表格模式
                          </button>
                          <button
                            type="button"
                            className={`toggle-btn ${transformParseViewMode === 'json' ? 'is-active' : ''
                              }`}
                            onClick={() => setTransformParseViewMode('json')}
                          >
                            JSON 模式
                          </button>
                        </div>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={transformParseShowEmpty}
                          onChange={e => setTransformParseShowEmpty(e.target.checked)}
                        />
                        <span className="switch-slider"></span>
                        <span className="switch-label">显示空值</span>
                      </label>
                    </div>
                    <div
                      className={`mode-content ${transformParseViewMode === 'table' ? 'is-active' : ''
                        }`}
                    >
                      {transformParseResult ? (
                        <Table
                          size="small"
                          columns={resultColumns}
                          dataSource={filterFieldsByShowEmpty(
                            getFieldsFromTransformParseResult(transformParseResult),
                            transformParseShowEmpty
                          )}
                          pagination={false}
                          rowKey="no"
                          className="data-table compact"
                          scroll={{ y: 300 }}
                        />
                      ) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                          解析结果将显示在这里
                        </div>
                      )}
                    </div>
                    <div
                      className={`mode-content ${transformParseViewMode === 'json' ? 'is-active' : ''
                        }`}
                    >
                      {transformParseResult ? (
                        <pre
                          className="code-block"
                          style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                        >
                          {JSON.stringify(
                            {
                              ...transformParseResult,
                              fields: filterFieldsByShowEmpty(
                                getFieldsFromTransformParseResult(transformParseResult),
                                transformParseShowEmpty
                              ),
                            },
                            null,
                            2
                          )}
                        </pre>
                      ) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                          解析结果将显示在这里
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="panel-block panel-block--scrollable">
                    <div className="block-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h3>转换结果</h3>
                        <div className="mode-toggle">
                          <button
                            type="button"
                            className={`toggle-btn ${transformResultViewMode === 'table' ? 'is-active' : ''
                              }`}
                            onClick={() => setTransformResultViewMode('table')}
                          >
                            表格模式
                          </button>
                          <button
                            type="button"
                            className={`toggle-btn ${transformResultViewMode === 'json' ? 'is-active' : ''
                              }`}
                            onClick={() => setTransformResultViewMode('json')}
                          >
                            JSON 模式
                          </button>
                        </div>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={transformResultShowEmpty}
                          onChange={e => setTransformResultShowEmpty(e.target.checked)}
                        />
                        <span className="switch-slider"></span>
                        <span className="switch-label">显示空值</span>
                      </label>
                    </div>
                    <div
                      className={`mode-content ${transformResultViewMode === 'table' ? 'is-active' : ''
                        }`}
                    >
                      {transformError ? (
                        renderTransformError()
                      ) : transformResult ? (
                        <Table
                          size="small"
                          columns={resultColumns}
                          dataSource={filterFieldsByShowEmpty(
                            transformResult.fields,
                            transformResultShowEmpty
                          )}
                          pagination={false}
                          rowKey="no"
                          className="data-table compact"
                          scroll={{ y: 300 }}
                        />
                      ) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                          转换结果将显示在这里
                        </div>
                      )}
                    </div>
                    <div
                      className={`mode-content ${transformResultViewMode === 'json' ? 'is-active' : ''
                        }`}
                    >
                      {transformError ? (
                        renderTransformError()
                      ) : transformResult ? (
                        <pre
                          className="code-block"
                          style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                        >
                          {(() => {
                            if (transformResult.formatJson) {
                              try {
                                const parsed = JSON.parse(transformResult.formatJson);
                                if (transformResultShowEmpty) {
                                  return JSON.stringify(parsed, null, 2);
                                }
                                return JSON.stringify(filterEmptyFields(parsed), null, 2);
                              } catch (_e) {
                                return transformResult.formatJson;
                              }
                            }
                            return JSON.stringify(
                              {
                                ...transformResult,
                                fields: filterFieldsByShowEmpty(
                                  transformResult.fields,
                                  transformResultShowEmpty
                                ),
                              },
                              null,
                              2
                            );
                          })()}
                        </pre>
                      ) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                          转换结果将显示在这里
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </article>
      </section>
    </>
  );
}

export default SimulateDebugPage;
