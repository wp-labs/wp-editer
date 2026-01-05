import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ConfigProvider, Button, Modal } from 'antd';
import { RedditOutlined, SlackOutlined, GithubOutlined, WechatOutlined, QuestionCircleOutlined } from '@ant-design/icons';
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
function SimpleHeader({ onWechatClick }) {
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
            fontWeight: 600,
            fontSize: '15px',
          }}
          onClick={() => window.open('https://www.reddit.com/r/warppase/', '_blank')}
        >
          Reddit
        </Button>
        <Button
          type="primary"
          icon={<GithubOutlined style={{ fontSize: '18px' }} />}
          size="large"
          style={{
            fontWeight: 600,
            fontSize: '15px',
          }}
          onClick={() => window.open('https://github.com/wp-labs/wp-rule/issues', '_blank')}
        >
          GitHub
        </Button>
        <Button
          type="primary"
          icon={
            <svg
              viewBox="0 0 36 28"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '18px', height: '18px', fill: 'currentColor' }}
            >
              <path d="M17.5875 6.77268L21.8232 3.40505L17.5875 0.00748237L17.5837 0L13.3555 3.39757L17.5837 6.76894L17.5875 6.77268ZM17.5863 17.3955H17.59L28.5161 8.77432L25.5526 6.39453L17.59 12.6808H17.5863L17.5825 12.6845L9.61993 6.40201L6.66016 8.78181L17.5825 17.3992L17.5863 17.3955ZM17.5828 23.2891L17.5865 23.2854L32.2133 11.7456L35.1768 14.1254L28.5238 19.3752L17.5865 28L0.284376 14.3574L0 14.1291L2.95977 11.7531L17.5828 23.2891Z" />
            </svg>
          }
          size="large"
          style={{
            fontWeight: 600,
            fontSize: '15px',
          }}
          onClick={() => window.open('https://juejin.cn/user/239030525498106', '_blank')}
        >
          掘金
        </Button>
        <Button
          type="primary"
          icon={<QuestionCircleOutlined style={{ fontSize: '18px' }} />}
          size="large"
          style={{
            fontWeight: 600,
            fontSize: '15px',
          }}
          onClick={() => window.open('https://wp-labs.github.io/wp-docs/', '_blank')}
        >
          帮助中心
        </Button>
        <Button
          type="primary"
          icon={<WechatOutlined style={{ fontSize: '20px' }} />}
          size="large"
          shape="circle"
          style={{
            background: '#07C160',
            borderColor: '#07C160',
          }}
          onClick={onWechatClick}
        />
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
  const [wechatModalOpen, setWechatModalOpen] = useState(false);

  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <div className="app-shell">
        <SimpleHeader onWechatClick={() => setWechatModalOpen(true)} />
        <div className="app-shell-body">
          <div className="main-content">
            <Routes>
              <Route path="/" element={<SimulateDebugPage />} />
              <Route path="/simulate-debug" element={<SimulateDebugPage />} />
              <Route path="*" element={<SimulateDebugPage />} />
            </Routes>
          </div>
        </div>

        {/* 微信群二维码弹窗 */}
        <Modal
          title="加入 WarpPase 官方支持交流群"
          open={wechatModalOpen}
          onCancel={() => setWechatModalOpen(false)}
          footer={null}
          centered
          width={400}
        >
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <img
              src="/assets/images/vx.png"
              alt="微信群二维码"
              style={{ width: '100%', maxWidth: '300px', borderRadius: '8px' }}
            />
            <div style={{ marginTop: 16, color: '#666', fontSize: 14 }}>
              扫描二维码加入微信群
            </div>
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
}

export default App;
