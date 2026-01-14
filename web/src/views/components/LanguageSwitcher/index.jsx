import { Button } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';

const LanguageSwitcher = ({ onLocaleChange }) => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh-CN' ? 'en-US' : 'zh-CN';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
    // 通知父组件更新 Ant Design 的 locale
    onLocaleChange(newLang === 'zh-CN' ? zhCN : enUS);
  };

  const currentLang = i18n.language === 'zh-CN' ? 'EN' : '中文';

  return (
    <Button
      type="primary"
      icon={<GlobalOutlined style={{ fontSize: '18px' }} />}
      size="large"
      style={{
        fontWeight: 600,
        fontSize: '15px',
      }}
      onClick={toggleLanguage}
    >
      {currentLang}
    </Button>
  );
};

export default LanguageSwitcher;
