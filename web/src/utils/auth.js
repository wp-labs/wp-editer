/**
 * 身份验证工具函数
 * 提供登录状态的本地存储管理
 * 注意：当前项目使用 sessionStorage，此文件暂未使用
 */

// localStorage 存储键名
const AUTH_KEY = 'wpediter_auth_logged_in';

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
export function isLoggedIn() {
  // 服务端渲染环境检查
  if (typeof window === 'undefined') {
    return false;
  }
  
  return window.localStorage.getItem(AUTH_KEY) === '1';
}

/**
 * 设置用户为已登录状态
 */
export function setLoggedIn() {
  // 服务端渲染环境检查
  if (typeof window === 'undefined') {
    return;
  }
  
  window.localStorage.setItem(AUTH_KEY, '1');
}

/**
 * 清除用户登录状态
 */
export function clearLoggedIn() {
  // 服务端渲染环境检查
  if (typeof window === 'undefined') {
    return;
  }
  
  window.localStorage.removeItem(AUTH_KEY);
}
