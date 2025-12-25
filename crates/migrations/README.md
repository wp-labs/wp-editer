# 数据库迁移文件

本目录包含 wpEditor 项目的数据库迁移脚本。

## 文件说明

- `V001__init_database.sql` - 初始化数据库表结构
- `V002__seed_data.sql` - 插入初始化数据

## 数据库配置

- **数据库类型**: PostgreSQL 12+
- **数据库名称**: wp-editor
- **字符集**: UTF8
- **时区**: UTC

## 使用方法

### 方法一：使用 psql 手动执行

```bash
# 1. 创建数据库
createdb wp-editor

# 2. 连接数据库
psql -d wp-editor

# 3. 执行迁移脚本
\i migrations/V001__init_database.sql
\i migrations/V002__seed_data.sql
```

### 方法二：使用脚本批量执行

```bash
# 创建数据库并执行所有迁移
psql -U postgres -c "CREATE DATABASE \"wp-editor\";"
psql -U postgres -d wp-editor -f migrations/V001__init_database.sql
psql -U postgres -d wp-editor -f migrations/V002__seed_data.sql
```

### 方法三：使用 Docker Compose

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: wp-editor
      POSTGRES_USER: wpEditor
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
    volumes:
      - ./migrations:/docker-entrypoint-initdb.d
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 方法四：使用 Rust 迁移工具（推荐）

#### 使用 sqlx-cli

```bash
# 安装 sqlx-cli
cargo install sqlx-cli --no-default-features --features postgres

# 设置数据库 URL
export DATABASE_URL="postgresql://username:password@localhost/wp-editor"

# 创建数据库
sqlx database create

# 运行迁移
sqlx migrate run
```

#### 使用 refinery

在 `Cargo.toml` 中添加依赖：

```toml
[dependencies]
refinery = { version = "0.8", features = ["tokio-postgres"] }
tokio-postgres = "0.7"
```

在代码中运行迁移：

```rust
use refinery::embed_migrations;

embed_migrations!("migrations");

async fn run_migrations(client: &mut tokio_postgres::Client) {
    migrations::runner()
        .run_async(client)
        .await
        .expect("Failed to run migrations");
}
```

## 表结构概览

### 核心业务表
1. **connections** - 连接管理
2. **rule_configs** - 规则配置（WPL/OML等）
3. **knowledge_configs** - 知识库配置
4. **parse_configs** - 解析配置
5. **connection_configs** - 连接配置文件
6. **releases** - 发布记录
7. **release_stages** - 发布阶段
8. **release_diffs** - 发布差异
9. **performance_tasks** - 性能测试任务
10. **performance_results** - 性能测试结果

### 系统管理表（预留）
11. **users** - 用户表
12. **audit_logs** - 操作日志
13. **help_docs** - 帮助文档

## 初始化数据

执行 `V002__seed_data.sql` 后会自动创建：

- 默认管理员账号：`admin` / `admin123`
- 示例连接配置
- 示例规则配置（nginx）
- 示例帮助文档
- 示例发布记录

## 注意事项

1. **密码安全**: 初始化数据中的密码哈希是示例，生产环境请使用 bcrypt 重新生成
2. **执行顺序**: 必须按照版本号顺序执行迁移文件
3. **幂等性**: 所有迁移脚本都使用了 `IF NOT EXISTS` 或 `ON CONFLICT` 确保可重复执行
4. **备份**: 在生产环境执行迁移前，请先备份数据库

## 回滚策略

如需回滚，可以创建对应的回滚脚本：

```sql
-- V001__init_database.down.sql
DROP TABLE IF EXISTS help_docs CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
-- ... 其他表
```

## 版本管理

迁移文件命名规范：

```
V{version}__{description}.sql
```

- `version`: 三位数字，如 001, 002, 003
- `description`: 简短的英文描述，使用下划线分隔

示例：
- `V001__init_database.sql`
- `V002__seed_data.sql`
- `V003__add_user_avatar.sql`

## 连接字符串格式

```
postgresql://[user[:password]@][host][:port][/dbname][?param1=value1&...]
```

示例：
```
postgresql://wpEditor:password@localhost:5432/wp-editor
postgresql://postgres@localhost/wp-editor
```

## 常见问题

### Q: 如何查看当前数据库版本？

可以创建一个版本管理表：

```sql
CREATE TABLE schema_migrations (
    version VARCHAR(50) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Q: 如何在 Rust 中连接数据库？

推荐使用 `sqlx` 或 `tokio-postgres`：

```rust
use sqlx::postgres::PgPoolOptions;

let pool = PgPoolOptions::new()
    .max_connections(5)
    .connect("postgresql://user:pass@localhost/wp-editor")
    .await?;
```

### Q: 如何处理敏感信息？

- 使用环境变量存储数据库密码
- Git Token 等敏感字段应在应用层加密后存储
- 不要在代码中硬编码密码

## 相关文档

- [数据库设计文档](../doc/database-design.md)
- [API 设计文档](../doc/api-design-v2.md)
