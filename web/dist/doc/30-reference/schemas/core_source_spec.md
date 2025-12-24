# CoreSourceSpec
<!-- 角色：开发者 | 最近验证：2025-10-15 -->

字段
- `name`：源名称（key）
- `kind`：源类型（file/syslog/kafka/...）
- `params`：扁平参数表
- `tags`：tags 字符串数组

说明：运行期将桥接为 ResolvedSourceSpec。
