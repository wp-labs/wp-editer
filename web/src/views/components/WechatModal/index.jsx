import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';

function WechatModal({ open, onCancel }) {
  const { t } = useTranslation();

  return (
    <Modal
      title={t('modal.wechat.title')}
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={400}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <img
          src="/assets/images/community.png"
          alt="微信群二维码"
          style={{ width: '100%', maxWidth: '300px', borderRadius: '8px' }}
        />
        <div style={{ marginTop: 16, color: '#666', fontSize: 14 }}>
          {t('modal.wechat.scanTip')}
        </div>
      </div>
    </Modal>
  );
}

export default WechatModal;
