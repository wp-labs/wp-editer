import { useTranslation } from 'react-i18next';

function VersionInfo({ versionInfo }) {
  const { t } = useTranslation();

  return (
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
        <span style={{ display: 'block' }}>
          {t('header.version.wpEditor')}: {versionInfo.wpEditor}
        </span>
      )}
      {versionInfo.warpEngine || versionInfo.warpParse ? (
        <span style={{ display: 'block' }}>
          {versionInfo.warpEngine ? t('header.version.warpEngine') : t('header.version.warpParse')}:{' '}
          {versionInfo.warpEngine || versionInfo.warpParse}
        </span>
      ) : (
        <span style={{ opacity: 0.7, display: 'block' }}>
          {t('header.version.warpEngine')}: -
        </span>
      )}
    </span>
  );
}

export default VersionInfo;
