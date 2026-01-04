import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ConfigProvider, Button } from 'antd';
import { RedditOutlined, SlackOutlined } from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import SimulateDebugPage from '@/views/pages/simulate-debug';
import httpRequest from '@/services/request';

// Ant Design 自定义主题配置
const theme = {
  token: {
    colorPrimary: '#275efe',
    colorSuccess: '#17b26a',
    colorWarning: '#f79009',
    colorError: '#f1554c',
    colorInfo: '#12a6e8',
    colorTextBase: '#1b2533',
    colorBgBase: '#ffffff',
    borderRadius: 12,
    fontFamily: '"PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif',
  },
};

// 简化版导航栏组件，只包含logo展示
function SimpleHeader() {
  const [versionInfo, setVersionInfo] = useState({ wpEditor: '', warpParse: '', warpEngine: '' });

  // 获取版本信息：wp-editor 与 warp-parse/warp-engine
  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await httpRequest.get('/version');
        setVersionInfo({
          wpEditor: response?.wp_editor || '',
          warpParse: response?.warp_parse || '',
          warpEngine: response?.warp_engine || '',
        });
      } catch (error) {
        // 忽略版本获取失败，不影响主流程
      }
    };

    fetchVersion();
  }, []);

  return (
    <header className="main-header">
      <div className="brand" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <img
          src="/assets/images/index.png"
          alt="WpEditor"
          className="logo"
          style={{ height: '70px' }}
        />
        <span className="divider">|</span>
        {/* 确保显示subtitle */}
        <span
          className="subtitle"
          style={{ marginRight: 10, color: '#fff', fontSize: '20px', fontWeight: '600' }}
        >
          Wp Editor
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* 社区快速访问按钮 */}
        <Button
          type="primary"
          icon={<SlackOutlined style={{ fontSize: '18px' }} />}
          size="large"
          style={{
            background: '#4A154B',
            borderColor: '#4A154B',
            fontWeight: 600,
            fontSize: '15px',
          }}
          onClick={() =>
            window.open('https://app.slack.com/client/T0A53FLT4R4/C0A4Q3SC2CF', '_blank')
          }
        >
          Slack
        </Button>
        <Button
          type="primary"
          icon={<RedditOutlined style={{ fontSize: '18px' }} />}
          size="large"
          style={{
            background: '#FF4500',
            borderColor: '#FF4500',
            fontWeight: 600,
            fontSize: '15px',
          }}
          onClick={() => window.open('https://www.reddit.com/r/warppase/', '_blank')}
        >
          Reddit
        </Button>
        {/* 版本信息 */}
        <span
          className="version-info"
          style={{
            fontSize: 12,
            color: '#fff',
            display: 'inline-block',
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '8px 12px',
            borderRadius: '4px',
            lineHeight: '1.4',
          }}
        >
          {versionInfo.wpEditor && (
            <span style={{ display: 'block' }}>wp-editor: {versionInfo.wpEditor}</span>
          )}
          {/* 显示warp-engine，如果没有则显示warp-parse */}
          {versionInfo.warpEngine || versionInfo.warpParse ? (
            <span style={{ display: 'block' }}>
              {versionInfo.warpEngine ? 'warp-engine' : 'warp-parse'}:{' '}
              {versionInfo.warpEngine || versionInfo.warpParse}
            </span>
          ) : (
            <span style={{ opacity: 0.7, display: 'block' }}>warp-engine: -</span>
          )}
        </span>
      </div>
    </header>
  );
}

function App() {
  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <div className="app-shell">
        <SimpleHeader />
        <div className="app-shell-body">
          <div className="main-content">
            <Routes>
              <Route path="/" element={<SimulateDebugPage />} />
              <Route path="/simulate-debug" element={<SimulateDebugPage />} />
              <Route path="*" element={<SimulateDebugPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
