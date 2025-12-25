-- WpEditor 数据库初始化脚本
-- 版本: V001
-- 描述: 创建基础表结构

-- ============================================
-- 1. 知识库配置表
-- ============================================
CREATE TABLE IF NOT EXISTS knowledge_configs (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(200) NOT NULL UNIQUE,
    config_content TEXT,
    create_sql TEXT,
    insert_sql TEXT,
    data_content TEXT,
    tag_name VARCHAR(200),
    owner VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
);

CREATE INDEX idx_knowledge_tag_name ON knowledge_configs(tag_name);
CREATE INDEX idx_knowledge_status ON knowledge_configs(status);

COMMENT ON TABLE knowledge_configs IS '知识库配置表';
COMMENT ON COLUMN knowledge_configs.status IS '状态: active/inactive';