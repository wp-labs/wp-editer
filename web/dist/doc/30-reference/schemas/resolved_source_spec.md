# ResolvedSourceSpec
<!-- 角色：开发者 | 最近验证：2025-10-15 -->

字段
- `name`：源名称
- `kind`：源类型
- `connector_id`：绑定的 connector 标识
  - 语义：经 connectors 装配生成时应为非空；少数工具/诊断场景（如临时 ping）可留空字符串表示“未绑定”。
- `params`：扁平参数表（含白名单覆写后结果）
- `tags`：tags 字符串数组（入口注入）
