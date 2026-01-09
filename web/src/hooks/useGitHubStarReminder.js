import { useState, useEffect } from 'react';

/**
 * GitHub Star 提醒 Hook
 * 首次访问页面10分钟后显示提示
 */
export const useGitHubStarReminder = () => {
  const [showReminder, setShowReminder] = useState(false);
  const STORAGE_KEY = 'github_star_reminder';
  const REMINDER_DELAY = 10 * 60 * 1000; // 10分钟

  useEffect(() => {
    // 检查是否已经显示过提示
    const reminderData = localStorage.getItem(STORAGE_KEY);
    
    if (reminderData) {
      const { shown } = JSON.parse(reminderData);
      if (shown) {
        return; // 已经显示过，不再提示
      }
    }

    // 记录首次访问时间
    if (!reminderData) {
      const firstVisit = {
        timestamp: Date.now(),
        shown: false,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(firstVisit));
    }

    // 设置定时器，10分钟后显示提示
    const timer = setTimeout(() => {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const { shown } = JSON.parse(data);
        if (!shown) {
          setShowReminder(true);
        }
      }
    }, REMINDER_DELAY);

    return () => clearTimeout(timer);
  }, []);

  // 关闭提示并标记为已显示
  const closeReminder = () => {
    setShowReminder(false);
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      parsed.shown = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  };

  // 跳转到 GitHub 并关闭提示
  const goToGitHub = () => {
    window.open('https://github.com/wp-labs/wp-rule', '_blank');
    closeReminder();
  };

  return {
    showReminder,
    closeReminder,
    goToGitHub,
  };
};
