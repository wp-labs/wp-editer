import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Menu, Table, Modal, message, Tree } from "antd";
import { fetchUsers } from "@/services/user";

/**
 * 系统管理页面
 * 功能：
 * 1. 用户管理（查询、编辑、禁用、删除等）
 * 2. 操作日志查看
 * 3. 帮助中心
 * 对应原型：pages/views/system-manage/user-list.html
 */
function SystemManagePage() {
  const [activeKey, setActiveKey] = useState("users");
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [searchForm, setSearchForm] = useState({
    username: "",
    role: "",
    status: "",
  });

  // 操作日志相关状态
  const [logLoading, setLogLoading] = useState(false);
  const [logDataSource, setLogDataSource] = useState([]);
  const [logSearchForm, setLogSearchForm] = useState({
    operator: "",
    operation: "",
    startDate: "",
    endDate: "",
  });

  // 帮助中心相关状态
  const [helpSearchText, setHelpSearchText] = useState("");
  const [docToc, setDocToc] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  const [docContent, setDocContent] = useState("");
  const [docLoading, setDocLoading] = useState(false);

  /**
   * 加载用户列表数据
   */
  const loadUsers = async () => {
    setLoading(true);
    try {
      // 调用服务层获取用户列表（使用对象参数）
      const response = await fetchUsers(searchForm);
      setDataSource(response.items || []);
    } finally {
      setLoading(false);
    }
  };

  // 将 docToc（带 level 的扁平数组）转换为 antd Tree 所需的树形结构
  const buildDocTree = (items) => {
    const roots = [];
    const stack = [];

    items.forEach((item) => {
      const node = {
        title: item.title,
        key: item.id,
        path: item.path,
        level: item.level,
        children: [],
      };

      // 根据 level 维护父子关系
      while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        roots.push(node);
      } else {
        stack[stack.length - 1].children.push(node);
      }

      stack.push(node);
    });

    return roots;
  };

  /**
   * 加载操作日志数据
   */
  const loadLogs = async () => {
    setLogLoading(true);
    try {
      // 模拟加载操作日志
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLogDataSource([
        {
          id: 10001,
          operator: "admin",
          operation: "publish",
          target: "版本 v1.2.0",
          description: "发布系统版本到生产环境",
          ip: "192.168.1.100",
          time: "2024-11-06 14:30:25",
          status: "success",
        },
        {
          id: 10002,
          operator: "operator_01",
          operation: "update",
          target: "source 配置",
          description: "更新 kafka 连接参数",
          ip: "192.168.1.105",
          time: "2024-11-06 13:15:10",
          status: "success",
        },
        {
          id: 10003,
          operator: "operator_02",
          operation: "delete",
          target: "wpl 规则",
          description: "删除过期的解析规则",
          ip: "192.168.1.110",
          time: "2024-11-06 11:45:33",
          status: "success",
        },
        {
          id: 10004,
          operator: "admin",
          operation: "create",
          target: "用户 viewer_02",
          description: "创建新用户账号",
          ip: "192.168.1.100",
          time: "2024-11-06 10:20:15",
          status: "success",
        },
        {
          id: 10005,
          operator: "operator_01",
          operation: "update",
          target: "sink 配置",
          description: "更新文件输出路径",
          ip: "192.168.1.105",
          time: "2024-11-06 09:10:50",
          status: "error",
        },
      ]);
    } finally {
      setLogLoading(false);
    }
  };

  // 当切换到对应页面时加载数据
  useEffect(() => {
    if (activeKey === "users") {
      loadUsers();
    } else if (activeKey === "logs") {
      loadLogs();
    }
  }, [activeKey]);

  // 解析 SUMMARY.md 为简单的文档目录
  const parseSummary = (markdownText) => {
    const lines = markdownText.split(/\r?\n/);
    const items = [];
    lines.forEach((line) => {
      const match = line.match(/^(\s*)- \[(.+?)\]\((.+?)\)/);
      if (match) {
        const indent = match[1] || "";
        const title = match[2];
        const path = match[3];
        const level = Math.floor(indent.length / 2);
        items.push({ id: `${title}-${path}`, title, path, level });
      }
    });
    return items;
  };

  const loadDocContent = async (docPath) => {
    if (!docPath) return;
    setDocLoading(true);
    try {
      const response = await fetch(`/doc/${docPath}`);
      if (!response.ok) {
        setDocContent(`无法加载文档：${docPath} (HTTP ${response.status})`);
        return;
      }
      const text = await response.text();
      setDocContent(text);
    } catch (error) {
      setDocContent(`加载文档失败：${String(error)}`);
    } finally {
      setDocLoading(false);
    }
  };

  // 当进入帮助中心时，加载 SUMMARY.md 并初始化文档目录
  useEffect(() => {
    const loadSummary = async () => {
      try {
        const response = await fetch("/doc/SUMMARY.md");
        if (!response.ok) {
          return;
        }
        const text = await response.text();
        const items = parseSummary(text);
        setDocToc(items);
        if (!activeDoc && items.length > 0) {
          const firstDoc =
            items.find((item) => item.path && item.path.endsWith(".md")) ||
            items[0];
          setActiveDoc(firstDoc);
          loadDocContent(firstDoc.path);
        }
      } catch (error) {
        // ignore, 在 UI 中通过内容区域提示
        setDocContent(`加载文档目录失败：${String(error)}`);
      }
    };

    if (activeKey === "help" && docToc.length === 0) {
      loadSummary();
    }
  }, [activeKey, docToc.length, activeDoc]);

  /**
   * 处理搜索按钮点击
   */
  const handleSearch = () => {
    loadUsers();
    message.info("查询功能执行中...");
  };

  /**
   * 处理重置按钮点击
   * 清空搜索表单
   */
  const handleReset = () => {
    setSearchForm({ username: "", role: "", status: "" });
  };

  /**
   * 处理用户操作
   * @param {string} action - 操作类型（edit/reset-password/disable/enable/delete）
   * @param {Object} userRecord - 用户记录
   */
  const handleAction = (action, userRecord) => {
    const actionMap = {
      edit: () => message.info(`编辑用户：${userRecord.username}`),
      "reset-password": () => {
        Modal.confirm({
          title: "重置密码",
          content: `确定要重置用户 "${userRecord.username}" 的密码吗？新密码将发送到用户邮箱。`,
          onOk: () =>
            message.success(`用户 "${userRecord.username}" 的密码已重置`),
        });
      },
      disable: () => {
        Modal.confirm({
          title: "禁用用户",
          content: `确定要禁用用户 "${userRecord.username}" 吗？禁用后该用户将无法登录系统。`,
          onOk: () => message.success(`用户 "${userRecord.username}" 已禁用`),
        });
      },
      enable: () => {
        Modal.confirm({
          title: "启用用户",
          content: `确定要启用用户 "${userRecord.username}" 吗？`,
          onOk: () => message.success(`用户 "${userRecord.username}" 已启用`),
        });
      },
      delete: () => {
        Modal.confirm({
          title: "删除用户",
          content: `确定要删除用户 "${userRecord.username}" 吗？此操作不可恢复！`,
          okType: "danger",
          onOk: () => message.success(`用户 "${userRecord.username}" 已删除`),
        });
      },
    };
    actionMap[action]?.();
  };

  /**
   * 获取角色徽章
   * @param {string} role - 角色
   * @returns {JSX.Element} 徽章元素
   */
  const getRoleBadge = (role) => {
    const roleMap = {
      admin: { label: "管理员", className: "badge--primary" },
      operator: { label: "运维人员", className: "badge--info" },
      viewer: { label: "访客", className: "badge--secondary" },
    };
    const config = roleMap[role] || {
      label: role,
      className: "badge--secondary",
    };
    return <span className={`badge ${config.className}`}>{config.label}</span>;
  };

  /**
   * 获取状态标签
   * @param {string} status - 状态
   * @returns {JSX.Element} 标签元素
   */
  const getStatusTag = (status) => {
    const statusMap = {
      active: { label: "启用", className: "status-tag--success" },
      inactive: { label: "禁用", className: "status-tag--inactive" },
    };
    const config = statusMap[status] || {
      label: status,
      className: "status-tag--inactive",
    };
    return (
      <span className={`status-tag ${config.className}`}>{config.label}</span>
    );
  };

  const columns = [
    { title: "用户ID", dataIndex: "id", key: "id", width: 100 },
    { title: "用户名", dataIndex: "username", key: "username", width: 120 },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: getRoleBadge,
    },
    { title: "邮箱", dataIndex: "email", key: "email", width: 200 },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: getStatusTag,
    },
    { title: "创建时间", dataIndex: "createdAt", key: "createdAt", width: 180 },
    {
      title: "操作",
      key: "actions",
      width: 360,
      render: (_, record) => (
        <div
          className="btn-group"
          style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}
        >
          <button
            type="button"
            className="btn btn-sm"
            style={{
              background: "#e8f4fd",
              color: "var(--primary)",
              padding: "4px 10px",
              fontSize: "13px",
            }}
            onClick={() => handleAction("edit", record)}
          >
            编辑
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{
              background: "#fff4e6",
              color: "var(--warning)",
              padding: "4px 10px",
              fontSize: "13px",
            }}
            onClick={() => handleAction("reset-password", record)}
          >
            重置密码
          </button>
          {record.status === "active" ? (
            <button
              type="button"
              className="btn btn-sm"
              style={{
                background: "#fef3f2",
                color: "var(--danger)",
                padding: "4px 10px",
                fontSize: "13px",
              }}
              onClick={() => handleAction("disable", record)}
            >
              禁用
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-sm"
              style={{
                background: "#e6f7ed",
                color: "var(--success)",
                padding: "4px 10px",
                fontSize: "13px",
              }}
              onClick={() => handleAction("enable", record)}
            >
              启用
            </button>
          )}
          <button
            type="button"
            className="btn btn-sm"
            style={{
              background: "#fef3f2",
              color: "var(--danger)",
              padding: "4px 10px",
              fontSize: "13px",
            }}
            onClick={() => handleAction("delete", record)}
          >
            删除
          </button>
        </div>
      ),
    },
  ];

  const menuItems = [
    { key: "users", label: "用户管理" },
    { key: "logs", label: "操作日志" },
    { key: "help", label: "帮助中心" },
  ];

  // 获取页面标题（与旧版本一致）
  const getPageTitle = () => {
    const titles = {
      users: "用户列表",
      logs: "操作日志",
      help: "帮助中心",
    };
    return titles[activeKey] || "系统管理";
  };

  return (
    <>
      <aside className="side-nav" data-group="system-manage">
        <h2>系统管理</h2>
        <button
          type="button"
          className={`side-item ${activeKey === "users" ? "is-active" : ""}`}
          onClick={() => setActiveKey("users")}
        >
          用户列表
        </button>
        <button
          type="button"
          className={`side-item ${activeKey === "logs" ? "is-active" : ""}`}
          onClick={() => setActiveKey("logs")}
        >
          操作日志
        </button>
        <button
          type="button"
          className={`side-item ${activeKey === "help" ? "is-active" : ""}`}
          onClick={() => setActiveKey("help")}
        >
          帮助中心
        </button>
      </aside>

      <section className="page-panels">
        <article className="panel is-visible">
          <header className="panel-header">
            <h2>{getPageTitle()}</h2>
            {activeKey === "users" && (
              <button
                type="button"
                className="btn primary"
                onClick={() => message.info("新增用户")}
              >
                新增用户
              </button>
            )}
          </header>
          <section className="panel-body">
            {activeKey === "users" && (
              <>
                <form className="form-grid">
                  <div className="form-row">
                    <label>用户名</label>
                    <input
                      type="text"
                      placeholder="请输入用户名"
                      value={searchForm.username}
                      onChange={(e) =>
                        setSearchForm({
                          ...searchForm,
                          username: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-row">
                    <label>角色</label>
                    <select
                      value={searchForm.role}
                      onChange={(e) =>
                        setSearchForm({ ...searchForm, role: e.target.value })
                      }
                    >
                      <option value="">全部</option>
                      <option value="admin">管理员</option>
                      <option value="operator">运维人员</option>
                      <option value="viewer">访客</option>
                    </select>
                  </div>
                  <div className="form-row">
                    <label>状态</label>
                    <select
                      value={searchForm.status}
                      onChange={(e) =>
                        setSearchForm({ ...searchForm, status: e.target.value })
                      }
                    >
                      <option value="">全部</option>
                      <option value="active">启用</option>
                      <option value="inactive">禁用</option>
                    </select>
                  </div>
                  <div className="form-row-actions">
                    <button
                      type="button"
                      className="btn primary"
                      onClick={handleSearch}
                    >
                      查询
                    </button>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={handleReset}
                    >
                      重置
                    </button>
                  </div>
                </form>

                <Table
                  rowKey="id"
                  loading={loading}
                  columns={columns}
                  dataSource={dataSource}
                  pagination={false}
                  className="data-table"
                />

                <div className="pagination">
                  <button type="button" className="btn ghost" disabled>
                    上一页
                  </button>
                  <span className="pagination-info">第 1 页 / 共 1 页</span>
                  <button type="button" className="btn ghost" disabled>
                    下一页
                  </button>
                </div>
              </>
            )}
            {activeKey === "logs" && (
              <>
                <form className="form-grid">
                  <div className="form-row">
                    <label>操作人</label>
                    <input
                      type="text"
                      placeholder="请输入操作人"
                      value={logSearchForm.operator}
                      onChange={(e) =>
                        setLogSearchForm({
                          ...logSearchForm,
                          operator: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-row">
                    <label>操作类型</label>
                    <select
                      value={logSearchForm.operation}
                      onChange={(e) =>
                        setLogSearchForm({
                          ...logSearchForm,
                          operation: e.target.value,
                        })
                      }
                    >
                      <option value="">全部</option>
                      <option value="create">新增</option>
                      <option value="update">修改</option>
                      <option value="delete">删除</option>
                      <option value="publish">发布</option>
                    </select>
                  </div>
                  <div className="form-row" style={{ gridColumn: "span 2" }}>
                    <label>时间范围</label>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="date"
                        value={logSearchForm.startDate}
                        onChange={(e) =>
                          setLogSearchForm({
                            ...logSearchForm,
                            startDate: e.target.value,
                          })
                        }
                        style={{ flex: 1 }}
                      />
                      <span>-</span>
                      <input
                        type="date"
                        value={logSearchForm.endDate}
                        onChange={(e) =>
                          setLogSearchForm({
                            ...logSearchForm,
                            endDate: e.target.value,
                          })
                        }
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                  <div className="form-row-actions">
                    <button
                      type="button"
                      className="btn primary"
                      onClick={() => {
                        message.info("查询功能执行中...");
                      }}
                    >
                      查询
                    </button>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => {
                        setLogSearchForm({
                          operator: "",
                          operation: "",
                          startDate: "",
                          endDate: "",
                        });
                      }}
                    >
                      重置
                    </button>
                  </div>
                </form>

                <Table
                  rowKey="id"
                  loading={logLoading}
                  columns={[
                    { title: "操作ID", dataIndex: "id", key: "id", width: 100 },
                    {
                      title: "操作人",
                      dataIndex: "operator",
                      key: "operator",
                      width: 120,
                    },
                    {
                      title: "操作类型",
                      dataIndex: "operation",
                      key: "operation",
                      width: 120,
                      render: (operation) => {
                        const operationMap = {
                          publish: {
                            label: "发布",
                            className: "badge--success",
                          },
                          update: { label: "修改", className: "badge--info" },
                          delete: {
                            label: "删除",
                            className: "badge--warning",
                          },
                          create: {
                            label: "新增",
                            className: "badge--primary",
                          },
                        };
                        const config = operationMap[operation] || {
                          label: operation,
                          className: "badge--secondary",
                        };
                        return (
                          <span className={`badge ${config.className}`}>
                            {config.label}
                          </span>
                        );
                      },
                    },
                    {
                      title: "操作对象",
                      dataIndex: "target",
                      key: "target",
                      width: 150,
                    },
                    {
                      title: "操作描述",
                      dataIndex: "description",
                      key: "description",
                      ellipsis: true,
                    },
                    { title: "IP地址", dataIndex: "ip", key: "ip", width: 140 },
                    {
                      title: "操作时间",
                      dataIndex: "time",
                      key: "time",
                      width: 180,
                    },
                    {
                      title: "状态",
                      dataIndex: "status",
                      key: "status",
                      width: 100,
                      render: (status) => {
                        const statusMap = {
                          success: {
                            label: "成功",
                            className: "status-tag--success",
                          },
                          error: {
                            label: "失败",
                            className: "status-tag--error",
                          },
                        };
                        const config = statusMap[status] || {
                          label: status,
                          className: "status-tag--inactive",
                        };
                        return (
                          <span className={`status-tag ${config.className}`}>
                            {config.label}
                          </span>
                        );
                      },
                    },
                  ]}
                  dataSource={logDataSource}
                  pagination={false}
                  className="data-table"
                />

                <div className="pagination">
                  <button type="button" className="btn ghost" disabled>
                    上一页
                  </button>
                  <span className="pagination-info">第 1 页 / 共 3 页</span>
                  <button type="button" className="btn ghost">
                    下一页
                  </button>
                </div>
              </>
            )}
            {activeKey === "help" && (
              <>
                <div
                  className="docs-layout"
                  style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "stretch",
                  }}
                >
                  <aside
                    className="docs-sidenav"
                    style={{
                      width: "260px",
                      padding: "16px 12px",
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      background: "#f9fafb",
                      overflow: "hidden",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        marginBottom: "12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        color: "#6b7280",
                      }}
                    >
                      文档目录
                    </div>
                    {docToc.length > 0 ? (
                      <Tree
                        treeData={buildDocTree(docToc)}
                        selectedKeys={activeDoc ? [activeDoc.id] : []}
                        blockNode
                        titleRender={(node) => (
                          <span
                            style={{
                              display: "block",
                              padding: "4px 8px",
                              borderRadius: 8,
                              color: "#1b2533",
                              fontWeight: node.level === 0 ? 600 : 400,
                              fontSize: 14,
                            }}
                          >
                            {node.title}
                          </span>
                        )}
                        onSelect={(keys, info) => {
                          const { node } = info;
                          if (!node || !node.path) return;
                          const selected = {
                            id: node.key,
                            title: node.title,
                            path: node.path,
                            level:
                              typeof node.level === "number" ? node.level : 0,
                          };
                          setActiveDoc(selected);
                          loadDocContent(node.path);
                        }}
                        style={{
                          height: "100%",
                          overflowY: "auto",
                          fontSize: "14px",
                          fontFamily:
                            '"PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif',
                          background: "#f9fafb",
                        }}
                      />
                    ) : (
                      <div style={{ fontSize: "13px", color: "#9ca3af" }}>
                        暂无文档目录或 SUMMARY.md 加载失败
                      </div>
                    )}
                  </aside>

                  <main
                    className="docs-content"
                    style={{
                      flex: 1,
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      background: "#ffffff",
                      padding: "20px 24px",
                      // 仅帮助中心内容区域滚动，顶部头部保持不动
                      maxHeight: "calc(100vh - 220px)",
                      overflowY: "auto",
                    }}
                  >
                    {docLoading ? (
                      <p style={{ fontSize: "14px", color: "#6b7280" }}>
                        文档加载中...
                      </p>
                    ) : docContent && docContent.trim().length > 0 ? (
                      <div className="markdown-body">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ node, ...props }) => (
                              <h1
                                style={{
                                  fontSize: "26px",
                                  fontWeight: 700,
                                  margin: "0 0 18px",
                                  color: "#111827",
                                }}
                                {...props}
                              />
                            ),
                            h2: ({ node, ...props }) => (
                              <h2
                                style={{
                                  fontSize: "22px",
                                  fontWeight: 600,
                                  margin: "28px 0 14px",
                                  borderBottom: "1px solid #e5e7eb",
                                  paddingBottom: "6px",
                                  color: "#111827",
                                }}
                                {...props}
                              />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3
                                style={{
                                  fontSize: "18px",
                                  fontWeight: 600,
                                  margin: "22px 0 10px",
                                  color: "#111827",
                                }}
                                {...props}
                              />
                            ),
                            p: ({ node, ...props }) => (
                              <p
                                style={{
                                  margin: "8px 0",
                                  fontSize: "14px",
                                  lineHeight: 1.7,
                                  color: "#374151",
                                }}
                                {...props}
                              />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul
                                style={{
                                  paddingLeft: "1.5em",
                                  margin: "8px 0",
                                  fontSize: "14px",
                                  color: "#374151",
                                }}
                                {...props}
                              />
                            ),
                            ol: ({ node, ...props }) => (
                              <ol
                                style={{
                                  paddingLeft: "1.5em",
                                  margin: "8px 0",
                                  fontSize: "14px",
                                  color: "#374151",
                                }}
                                {...props}
                              />
                            ),
                            li: ({ node, ...props }) => (
                              <li
                                style={{
                                  margin: "4px 0",
                                }}
                                {...props}
                              />
                            ),
                            code: ({ inline, node, ...props }) =>
                              inline ? (
                                <code
                                  style={{
                                    background: "rgba(15,23,42,0.04)",
                                    padding: "1px 4px",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                  }}
                                  {...props}
                                />
                              ) : (
                                <code
                                  style={{
                                    display: "block",
                                    background: "#0b1020",
                                    color: "#e5e7eb",
                                    padding: "12px 14px",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    overflowX: "auto",
                                    fontFamily:
                                      'Menlo, Monaco, Consolas, "Courier New", monospace',
                                  }}
                                  {...props}
                                />
                              ),
                            a: ({ node, ...props }) => (
                              <a
                                style={{
                                  color: "#2563eb",
                                  textDecoration: "none",
                                }}
                                {...props}
                              />
                            ),
                            table: ({ node, ...props }) => (
                              <div
                                style={{ overflowX: "auto", margin: "12px 0" }}
                              >
                                <table
                                  style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: "13px",
                                    color: "#374151",
                                  }}
                                  {...props}
                                />
                              </div>
                            ),
                            thead: ({ node, ...props }) => (
                              <thead
                                style={{
                                  background: "rgba(17,24,39,0.03)",
                                }}
                                {...props}
                              />
                            ),
                            th: ({ node, ...props }) => (
                              <th
                                style={{
                                  border: "1px solid #e5e7eb",
                                  padding: "6px 10px",
                                  textAlign: "left",
                                  fontWeight: 600,
                                }}
                                {...props}
                              />
                            ),
                            td: ({ node, ...props }) => (
                              <td
                                style={{
                                  border: "1px solid #e5e7eb",
                                  padding: "6px 10px",
                                  verticalAlign: "top",
                                }}
                                {...props}
                              />
                            ),
                          }}
                        >
                          {docContent}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p style={{ fontSize: "14px", color: "#6b7280" }}>
                        请选择左侧目录中的文档进行查看。
                      </p>
                    )}
                  </main>
                </div>
              </>
            )}
          </section>
        </article>
      </section>
    </>
  );
}

export default SystemManagePage;
