import { Button, Dropdown } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';

const LanguageSwitcher = ({ onLocaleChange }) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    // 通知父组件更新 Ant Design 的 locale
    onLocaleChange(lang === 'zh-CN' ? zhCN : enUS);
  };

  const items = [
    {
      key: 'zh-CN',
      label: '简体中文',
      onClick: () => changeLanguage('zh-CN'),
    },
    {
      key: 'en-US',
      label: 'English',
      onClick: () => changeLanguage('en-US'),
    },
  ];

  const currentLang = i18n.language === 'zh-CN' ? '中文' : 'EN';

  return (
    <Dropdown menu={{ items, selectedKeys: [i18n.language] }} placement="bottomRight">
      <Button
        type="primary"
        icon={<GlobalOutlined style={{ fontSize: '18px' }} />}
        size="large"
        style={{
          fontWeight: 600,
          fontSize: '15px',
        }}
      >
        {currentLang}
      </Button>
    </Dropdown>
  );
};

export default LanguageSwitcher;
