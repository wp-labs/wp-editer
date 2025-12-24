import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ConfigProvider } from 'antd';
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
  const [versionInfo, setVersionInfo] = useState({ wpEditer: '', warpParse: '' });

  // 获取版本信息：wp-editer 与 warp-parse
  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await httpRequest.get('/version');
        setVersionInfo({
          wpEditer: response?.wp_editer || '',
          warpParse: response?.warp_parse || '',
        });
      } catch (_error) {
        // 忽略版本获取失败，不影响主流程
      }
    };

    fetchVersion();
  }, []);

  return (
    <header className="main-header">
      <div className="brand">
        <img src="/assets/images/index.png" alt="WpEditer" className="logo" style={{ height: '70px' }} />
        <span className="divider">|</span>
        <span className="subtitle">控制平台</span>
        {versionInfo.wpEditer || versionInfo.warpParse ? (
          <span
            className="version-info"
            style={{ marginLeft: 8, fontSize: 12, color: '#fff' }}
          >
            {versionInfo.wpEditer && (
              <span style={{ marginRight: 8 }}>wp-editer: {versionInfo.wpEditer}</span>
            )}<br/>
            {versionInfo.warpParse && <span>warp-parse: {versionInfo.warpParse}</span>}
          </span>
        ) : null}
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
