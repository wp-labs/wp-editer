import React, { useState } from 'react';
import { Button, Card, Input, Layout, Menu, Radio, Space, Switch, Table, Typography } from 'antd';
import { parseLogs, convertRecord, fetchKnowledgeStatus } from '../../../services/debug';

const { TextArea } = Input;
const { Sider, Content } = Layout;

const EXAMPLE_LOG = `222.133.52.20 - - [06/Aug/2019:12:12:19 +0800] "GET /nginx-logo.png HTTP/1.1" 200 368 "http://119.122.1.4/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36" "-"`;

const EXAMPLE_RULE = `package /example/simple {
  rule nginx {
        (ip:sip,_^2,time:recv_time<[,]>,http/request",http/status,digit,chars",http/agent",_")
  }
}`;

export default function SimulateDebugPage() {
  const [activeKey, setActiveKey] = useState('parse');
  const [inputValue, setInputValue] = useState('');
  const [ruleValue, setRuleValue] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'json'
  const [showEmpty, setShowEmpty] = useState(true);

  const handleTest = async () => {
    setLoading(true);
    try {
      let res;
      if (activeKey === 'parse') {
        res = await parseLogs([inputValue], ruleValue);
        setResult(res);
      } else if (activeKey === 'convert') {
        res = await convertRecord(inputValue);
        setResult(res);
      } else if (activeKey === 'knowledge') {
        res = await fetchKnowledgeStatus();
        setResult(res);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExample = () => {
    setInputValue(EXAMPLE_LOG);
    setRuleValue(EXAMPLE_RULE);
  };

  const handleClear = () => {
    setInputValue('');
    setRuleValue('');
    setResult(null);
  };

  const menuItems = [
    { key: 'parse', label: '解析调试' },
    { key: 'convert', label: '转换调试' },
    { key: 'knowledge', label: '知识库校验' },
    { key: 'performance', label: '性能测试' },
  ];

  const resultColumns = [
    { title: 'no', dataIndex: 'no', key: 'no', width: 60 },
    { title: 'meta', dataIndex: 'meta', key: 'meta', width: 120 },
    { title: 'name', dataIndex: 'name', key: 'name', width: 150 },
    { title: 'value', dataIndex: 'value', key: 'value', ellipsis: true },
  ];

  return (
    <div className="warp-side-layout">
      <aside className="warp-sider">
        <h2 className="warp-sider-title">模拟调试</h2>
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems}
          onClick={({ key }) => {
            setActiveKey(key);
            setResult(null);
          }}
          style={{ background: 'transparent', border: 'none' }}
        />
      </aside>
      <div className="warp-panel">
        <Card>
          <Typography.Title level={4} style={{ marginBottom: 16 }}>
            {menuItems.find((m) => m.key === activeKey)?.label}
          </Typography.Title>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* 日志数据输入区 */}
            <Card size="small" title="日志数据" extra={
              <Space>
                <Button size="small" onClick={handleExample}>一键示例</Button>
                <Button size="small" onClick={handleClear}>一键清空</Button>
              </Space>
            }>
              <TextArea
                rows={4}
                placeholder="粘贴实时采集的原始日志，支持文本与文件导入"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: 13 }}
              />
            </Card>

            {/* 解析规则和结果（仅解析调试显示） */}
            {activeKey === 'parse' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* 解析规则 */}
                <Card size="small" title="解析规则" extra={
                  <Space>
                    <Button size="small">加载规则</Button>
                    <Button size="small" type="primary" onClick={handleTest} loading={loading}>
                      解析
                    </Button>
                  </Space>
                }>
                  <TextArea
                    rows={12}
                    value={ruleValue}
                    onChange={(e) => setRuleValue(e.target.value)}
                    style={{ fontFamily: 'monospace', fontSize: 13 }}
                  />
                </Card>

                {/* 解析结果 */}
                <Card 
                  size="small" 
                  title="解析结果"
                  extra={
                    <Space>
                      <Switch 
                        checked={showEmpty} 
                        onChange={setShowEmpty}
                        checkedChildren="显示空值"
                        unCheckedChildren="隐藏空值"
                      />
                    </Space>
                  }
                >
                  <Radio.Group 
                    value={viewMode} 
                    onChange={(e) => setViewMode(e.target.value)}
                    style={{ marginBottom: 12 }}
                    size="small"
                  >
                    <Radio.Button value="table">表格模式</Radio.Button>
                    <Radio.Button value="json">JSON 模式</Radio.Button>
                  </Radio.Group>
                  
                  <div style={{ maxHeight: 400, overflow: 'auto' }}>
                    {result && viewMode === 'table' && (
                      <Table
                        size="small"
                        columns={resultColumns}
                        dataSource={result.fields || []}
                        pagination={false}
                        rowKey="no"
                      />
                    )}
                    {result && viewMode === 'json' && (
                      <pre style={{
                        background: '#f5f5f5',
                        padding: 12,
                        borderRadius: 4,
                        margin: 0,
                        fontFamily: 'monospace',
                        fontSize: 12,
                      }}>
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    )}
                    {!result && (
                      <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                        点击"解析"按钮查看结果
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* 其他调试类型的简单布局 */}
            {activeKey !== 'parse' && (
              <>
                <Button type="primary" loading={loading} onClick={handleTest}>
                  执行测试
                </Button>
                {result && (
                  <Card size="small" title="测试结果">
                    <pre
                      style={{
                        background: '#f5f5f5',
                        padding: 16,
                        borderRadius: 4,
                        margin: 0,
                        overflow: 'auto',
                        fontFamily: 'monospace',
                        fontSize: 13,
                      }}
                    >
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </Card>
                )}
              </>
            )}
          </Space>
        </Card>
      </div>
    </div>
  );
}
