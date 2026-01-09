import { Modal, Button } from 'antd';
import { StarOutlined, GithubOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

function GitHubStarModal({ open, onCancel, onGoToGitHub }) {
  const { t } = useTranslation();

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StarOutlined style={{ color: '#faad14', fontSize: '20px' }} />
          <span>{t('modal.github.title')}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="later" onClick={onCancel}>
          {t('modal.github.later')}
        </Button>,
        <Button key="star" type="primary" icon={<GithubOutlined />} onClick={onGoToGitHub}>
          {t('modal.github.goToGitHub')}
        </Button>,
      ]}
      centered
      width={480}
    >
      <div style={{ padding: '20px 0' }}>
        <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '16px' }}>
          {t('modal.github.thanks')} <strong>WpEditor</strong>！
        </p>
        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#666' }}>
          {t('modal.github.description')}
        </p>
        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#666', marginTop: '12px' }}>
          {t('modal.github.support')}
        </p>
      </div>
    </Modal>
  );
}

export default GitHubStarModal;
