-- WpEditor 初始化数据脚本
-- 版本: V002
-- 描述: 插入初始化数据

-- ============================================
-- 1. 插入示例知识库配置
-- ============================================
INSERT INTO knowledge_configs (file_name, tag_name, owner, status, config_content, create_sql, data_content, created_by)
VALUES 
    ('example_score',
     'example_score',
     'ops_team',
     'active',
     E'version = 2\n\n[[tables]]\nname = "example_score"\ncolumns = ["name", "math", "english"]',
     'CREATE TABLE example_score (name TEXT, math INTEGER, english INTEGER);',
     E'name,math,english\ndayu_0,0,0\ndayu_1,1,1',
     'admin')
ON CONFLICT (file_name) DO NOTHING;
