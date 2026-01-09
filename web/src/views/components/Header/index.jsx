import { useState, useEffect, useRef } from 'react';
import { Button } from 'antd';
import { RedditOutlined, SlackOutlined, GithubOutlined, WechatOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import httpRequest from '@/services/request';
import LanguageSwitcher from '@/views/components/LanguageSwitcher';
import VersionInfo from '@/views/components/VersionInfo';

function Header({ onWechatClick, onLocaleChange }) {
  const { t } = useTranslation();
  const [versionInfo, setVersionInfo] = useState({ wpEditor: '', warpParse: '', warpEngine: '' });
  const versionFetchedRef = useRef(false);

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
        // 忽略版本获取失败
      }
    };

    if (versionFetchedRef.current) {
      return;
    }
    versionFetchedRef.current = true;
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
        <span
          className="subtitle"
          style={{ marginRight: 10, color: '#fff', fontSize: '20px', fontWeight: '600', paddingLeft: '16px' }}
        >
          {t('header.editor')}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Button
          type="primary"
          icon={<SlackOutlined style={{ fontSize: '18px' }} />}
          size="large"
          style={{ fontWeight: 600, fontSize: '15px' }}
          onClick={() => window.open('https://app.slack.com/client/T0A53FLT4R4/C0A4Q3SC2CF', '_blank')}
        >
          {t('header.slack')}
        </Button>
        <Button
          type="primary"
          icon={<RedditOutlined style={{ fontSize: '18px' }} />}
          size="large"
          style={{ fontWeight: 600, fontSize: '15px' }}
          onClick={() => window.open('https://www.reddit.com/r/warppase/', '_blank')}
        >
          {t('header.reddit')}
        </Button>
        <Button
          type="primary"
          icon={<GithubOutlined style={{ fontSize: '18px' }} />}
          size="large"
          style={{ fontWeight: 600, fontSize: '15px' }}
          onClick={() => window.open('https://github.com/wp-labs/wp-rule/issues', '_blank')}
        >
          {t('header.github')}
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
          style={{ fontWeight: 600, fontSize: '15px' }}
          onClick={() => window.open('https://juejin.cn/user/239030525498106', '_blank')}
        >
          {t('header.juejin')}
        </Button>
        <Button
          type="primary"
          icon={<QuestionCircleOutlined style={{ fontSize: '18px' }} />}
          size="large"
          style={{ fontWeight: 600, fontSize: '15px' }}
          onClick={() => window.open('https://wp-labs.github.io/wp-docs/', '_blank')}
        >
          {t('header.helpCenter')}
        </Button>
        <Button
          type="primary"
          icon={<WechatOutlined style={{ fontSize: '20px' }} />}
          size="large"
          shape="circle"
          style={{ background: '#07C160', borderColor: '#07C160' }}
          onClick={onWechatClick}
        />
        <LanguageSwitcher onLocaleChange={onLocaleChange} />
        <VersionInfo versionInfo={versionInfo} />
      </div>
    </header>
  );
}

export default Header;
