# ResolvedSinkSpec
<!-- 角色：开发者 | 最近验证：2025-10-15 -->

字段
- `group`：组名
- `name`：sink 名称
- `kind`：sink 类型
- `connector_id`：绑定的 connector 标识
  - 语义：经 connectors 装配生成时应为非空；少数工具/诊断场景（如临时 ping）可留空字符串表示“未绑定”。
- `params`：扁平参数表（含白名单覆写后结果）
- `filter`：可选过滤脚本路径
