import { Table, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { convertRecord, fetchDebugExamples, parseLogs, wplCodeFormat, omlCodeFormat, base64Decode } from '@/services/debug';
import CodeJarEditor from '@/views/components/CodeJarEditor';

/**
 * Wp Editor
 * 功能：
 * 1. 日志解析
 * 2. 记录转换
 * 3. 知识库状态查询
 * 对应原型：pages/views/simulate-debug/simulate-parse.html
 */

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
  const { t } = useTranslation();
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
      // 同步更新转换页的解析结果（使用原始数据用于转换，展示数据用于显示）
      if (response?.fields && response?.rawFields) {
        console.log('转换页解析结果:', response.rawFields);
        setTransformParseResult({ fields: response.rawFields, formatJson: response.formatJson });
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
        message.info(t('simulateDebug.examples.noAvailable'));
      }
    } catch (error) {
      message.error(`${t('simulateDebug.examples.fetchError')}：${error?.message || error}`);
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
      message.error(`${t('simulateDebug.parseRule.formatError')}：${error?.message || error}`);
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
      if (response?.fields && response?.rawFields) {
        setTransformParseResult({ fields: response.rawFields, formatJson: response.formatJson });
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
      message.error(`${t('simulateDebug.logData.base64Error')}：${error?.message || error}`);
    }
  };

  const handleTransform = async () => {
    if (!transformOml) {
      message.warning(t('simulateDebug.omlInput.fillOmlWarning'));
      return;
    }
    setLoading(true);
    setTransformError(null); // 重置转换错误状态
    try {
      console.log('转换页解析结果:', transformParseResult);
      const response = await convertRecord({ oml: transformOml, parseResult: transformParseResult });
      // 新 API 直接返回 { fields: [...] } 格式
      let fieldsData = [];
      if (Array.isArray(response?.fields)) {
        fieldsData = response.fields;
      } else if (response?.fields && Array.isArray(response?.fields?.items)) {
        fieldsData = response.fields.items;
      }
      setTransformResult({
        fields: fieldsData,
        formatJson: response.formatJson || '',
      });
      setTransformError(null);
    } catch (error) {
      message.error(`${t('simulateDebug.convertResult.convertError')}：${error?.message || error}`);
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
      message.error(`${t('simulateDebug.omlInput.formatError')}：${error?.message || error}`);
    }
  };

  const menuItems = [
    { key: 'parse', label: t('simulateDebug.tabs.parse') },
    { key: 'convert', label: t('simulateDebug.tabs.convert') },
  ];

  const resultColumns = [
    { title: t('simulateDebug.table.no'), dataIndex: 'no', key: 'no', width: 60 },
    { title: t('simulateDebug.table.meta'), dataIndex: 'meta', key: 'meta', width: 120 },
    { title: t('simulateDebug.table.name'), dataIndex: 'name', key: 'name', width: 150 },
    {
      title: t('simulateDebug.table.value'),
      dataIndex: 'value',
      key: 'value',
      style: { wordWrap: 'break-word', wordBreak: 'break-all', maxWidth: 300 },
    },
  ];

  /**
   * 按"显示空值"开关过滤字段列表
   * showEmptyFlag=false 时，过滤掉 value 为空字符串/null/undefined 的行
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
      const fieldValue = fieldItem.value;
      return fieldValue !== '' && fieldValue !== null && fieldValue !== undefined;
    });
  };

  /**
   * 从 value 对象中提取值
   * @param {Object} valueObj - value 对象，如 { "IpAddr": "..." } 或 { "Chars": "..." }
   * @returns {string} 提取的值字符串
   */
  const extractValueFromObj = (valueObj) => {
    if (!valueObj || typeof valueObj !== 'object') {
      return '';
    }
    const keys = Object.keys(valueObj);
    if (keys.length > 0 && valueObj[keys[0]] !== undefined) {
      return String(valueObj[keys[0]]);
    }
    return '';
  };

  /**
   * 处理转换页解析结果，添加 no 序号并提取 value 值
   * @param {Array} fields - 原始字段数组
   * @returns {Array} 处理后的字段数组
   */
  const processTransformParseFields = (fields) => {
    const list = Array.isArray(fields) ? fields : [];
    return list.map((field, index) => ({
      ...field,
      no: index + 1,
      value: extractValueFromObj(field?.value),
    }));
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
        <h4 style={{ color: '#f5222d', marginBottom: '8px', fontWeight: 'bold' }}>{t('simulateDebug.parseResult.parseFailed')}</h4>
        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', color: '#666', margin: '0 0 8px 0', fontSize: '14px', lineHeight: '1.5' }}>
          {parseError.message || t('simulateDebug.parseResult.parseError')}
        </pre>
        {parseError.code && (
          <p style={{ color: '#f5222d', margin: '8px 0 0 0' }}>
            <span style={{ fontWeight: 'bold' }}>{t('simulateDebug.parseResult.errorCode')}：</span>
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
      t('simulateDebug.convertResult.convertError');

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
        <h4 style={{ color: '#f5222d', marginBottom: '8px', fontWeight: 'bold' }}>{t('simulateDebug.convertResult.convertFailed')}</h4>
        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', color: '#666', margin: '0 0 8px 0', fontSize: '14px', lineHeight: '1.5' }}>
          {errorMessage}
        </pre>
        {transformError.code && (
          <p style={{ color: '#f5222d', margin: '8px 0 0 0' }}>
            <span style={{ fontWeight: 'bold' }}>{t('simulateDebug.parseResult.errorCode')}：</span>
            {transformError.code}
          </p>
        )}
      </div>
    );
  };

  // 获取页面标题（与旧版本一致）
  const getPageTitle = () => {
    const titles = {
      parse: t('simulateDebug.tabs.parse'),
      convert: t('simulateDebug.tabs.convert'),
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
            <h2>{t('simulateDebug.tabs.parse')}</h2>
          </button>
          <button
            type="button"
            className={`side-item ${activeKey === 'convert' ? 'is-active' : ''}`}
            onClick={() => setActiveKey('convert')}
          >
            <h2>{t('simulateDebug.tabs.convert')}</h2>
          </button>

        </aside>
        <div className="example-list example-list--compact example-list--spaced">
          <div className="example-list__header">
            <div>
              <h4 className="example-list__title">{t('simulateDebug.examples.title')}</h4>
              <p className="example-list__desc">{t('simulateDebug.examples.desc')}</p>
            </div>
          </div>
          {examplesLoading ? (
            <div className="example-list__message">{t('simulateDebug.examples.loading')}</div>
          ) : examples && examples.length > 0 ? (
            <div className="example-list__grid example-list__grid--small">
              {examples.map(exampleItem => (
                <button
                  key={exampleItem.name || exampleItem.key}
                  type="button"
                  className="example-list__item"
                  onClick={() => handleApplyExample(exampleItem)}
                >
                  {exampleItem.name || t('simulateDebug.examples.unnamed')}
                </button>
              ))}
            </div>
          ) : (
            <div className="example-list__message">{t('simulateDebug.examples.noData')}</div>
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
                      <h3>{t('simulateDebug.logData.title')}</h3>
                      <p className="block-desc">{t('simulateDebug.logData.desc')}</p>
                    </div>
                      <div className="block-actions" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            className="btn ghost"
                            onClick={handleBase64Decode}
                          >
                            {t('simulateDebug.logData.base64Decode')}
                          </button>
                          <button type="button" className="btn ghost" onClick={handleClear}>
                            {t('simulateDebug.logData.clearAll')}
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
                        <h3>{t('simulateDebug.parseRule.title')}</h3>
                        <div className="block-actions">
                          <button
                            type="button"
                            className="btn ghost"
                            onClick={wplFormat}
                          >
                            {t('simulateDebug.parseRule.format')}
                          </button>
                          <button
                            type="button"
                            className="btn primary"
                            onClick={handleTest}
                            disabled={loading}
                          >
                            {loading ? t('simulateDebug.parseRule.parsing') : t('simulateDebug.parseRule.parse')}
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
                          <h3>{t('simulateDebug.parseResult.title')}</h3>
                          <div className="mode-toggle">
                            <button
                              type="button"
                              className={`toggle-btn ${viewMode === 'table' ? 'is-active' : ''}`}
                              onClick={() => setViewMode('table')}
                            >
                              {t('simulateDebug.parseResult.tableMode')}
                            </button>
                            <button
                              type="button"
                              className={`toggle-btn ${viewMode === 'json' ? 'is-active' : ''}`}
                              onClick={() => setViewMode('json')}
                            >
                              {t('simulateDebug.parseResult.jsonMode')}
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
                          <span className="switch-label">{t('simulateDebug.parseResult.showEmpty')}</span>
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
                            {t('simulateDebug.parseResult.clickToParse')}
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
                            {t('simulateDebug.parseResult.clickToParse')}
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
                        <h3>{t('simulateDebug.omlInput.title')}</h3>
                        <p className="block-desc">{t('simulateDebug.omlInput.desc')}</p>
                      </div>
                      <div className="block-actions">
                        <button
                          type="button"
                          className="btn primary"
                          onClick={omlFormat}
                        >
                          {t('simulateDebug.omlInput.format')}
                        </button>
                        <button
                          type="button"
                          className="btn primary"
                          onClick={handleTransform}
                          disabled={loading}
                        >
                          {loading ? t('simulateDebug.omlInput.converting') : t('simulateDebug.omlInput.convert')}
                        </button>
                        <button
                          type="button"
                          className="btn ghost"
                          onClick={() => setTransformOml('')}
                        >
                          {t('simulateDebug.omlInput.clear')}
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
                        <h3>{t('simulateDebug.parseResult.title')}</h3>
                        <div className="mode-toggle">
                          <button
                            type="button"
                            className={`toggle-btn ${transformParseViewMode === 'table' ? 'is-active' : ''
                              }`}
                            onClick={() => setTransformParseViewMode('table')}
                          >
                            {t('simulateDebug.parseResult.tableMode')}
                          </button>
                          <button
                            type="button"
                            className={`toggle-btn ${transformParseViewMode === 'json' ? 'is-active' : ''
                              }`}
                            onClick={() => setTransformParseViewMode('json')}
                          >
                            {t('simulateDebug.parseResult.jsonMode')}
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
                        <span className="switch-label">{t('simulateDebug.parseResult.showEmpty')}</span>
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
                            processTransformParseFields(transformParseResult.fields),
                            transformParseShowEmpty
                          )}
                          pagination={false}
                          rowKey="no"
                          className="data-table compact"
                          scroll={{ y: 300 }}
                        />
                      ) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                          {t('simulateDebug.parseResult.willShowHere')}
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
                          {(() => {
                            if (transformParseResult.formatJson) {
                              try {
                                const parsed = JSON.parse(transformParseResult.formatJson);
                                return JSON.stringify(parsed, null, 2);
                              } catch (_e) {
                                return transformParseResult.formatJson;
                              }
                            }
                            return JSON.stringify(
                              {
                                ...transformParseResult,
                                fields: filterFieldsByShowEmpty(
                                  processTransformParseFields(transformParseResult.fields),
                                  transformParseShowEmpty
                                ),
                              },
                              null,
                              2
                            );
                          })()}
                        </pre>
                      ) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                          {t('simulateDebug.parseResult.willShowHere')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="panel-block panel-block--scrollable">
                    <div className="block-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h3>{t('simulateDebug.convertResult.title')}</h3>
                        <div className="mode-toggle">
                          <button
                            type="button"
                            className={`toggle-btn ${transformResultViewMode === 'table' ? 'is-active' : ''
                              }`}
                            onClick={() => setTransformResultViewMode('table')}
                          >
                            {t('simulateDebug.parseResult.tableMode')}
                          </button>
                          <button
                            type="button"
                            className={`toggle-btn ${transformResultViewMode === 'json' ? 'is-active' : ''
                              }`}
                            onClick={() => setTransformResultViewMode('json')}
                          >
                            {t('simulateDebug.parseResult.jsonMode')}
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
                        <span className="switch-label">{t('simulateDebug.parseResult.showEmpty')}</span>
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
                          {t('simulateDebug.convertResult.willShowHere')}
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
                          {t('simulateDebug.convertResult.willShowHere')}
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
