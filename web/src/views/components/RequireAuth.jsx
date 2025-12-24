import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getSessionUser } from '@/services/auth';

/**
 * 路由守卫组件
 * 功能：
 * 1. 保护需要登录才能访问的路由
 * 2. 未登录用户自动重定向到登录页
 * 3. 登录页本身不需要鉴权
 */
function RequireAuth({ children }) {
  const location = useLocation();

  // 登录页不需要鉴权，直接渲染
  if (location.pathname === '/login') {
    return children;
  }

  // 检查用户登录状态
  const sessionUser = getSessionUser();
  const isLoggedIn = sessionUser?.isLoggedIn || false;

  // 未登录则重定向到登录页
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // 已登录则渲染子组件
  return children;
}

export default RequireAuth;
