# Sinks 路由
<!-- 角色：使用配置者 | 最近验证：2025-12-11 -->

目标
- 基于目录式 routes（business.d/infra.d）配置路由分发；理解业务组与基础组的差异及命名规则。

核心概念（单点定义见 `../02-config/04-sinks_config.md`）
- 业务组 business.d：面向场景输出.
- 基础组 infra.d：系统级输出（default/miss/residue/error/monitor）。

目录与命名
- 业务组：`$SINK_ROOT/business.d/**/*.toml`，支持子目录递归；每个路由文件一个组。
- 基础组：`$SINK_ROOT/infra.d/**/*.toml`，支持子目录递归；固定组名（default/miss/...）。
- 连接器：从 `$WORK_ROOT/models/sinks` 起向上查找最近的 `connectors/sink.d/*.toml`。

最小示例（业务组）
```toml
version = "2.0"
[sink_group]
name = "/sink/demo"
oml  = ["/oml/example/*"]
parallel = 1

[[sink_group.sinks]]
name = "file_out"
connect = "file_json_sink"   # 连接器 id
params = { file = "demo.json" }
```


基础组示例（default）
```toml
version = "2.0"
[sink_group]
name = "default"

[[sink_group.sinks]]
name = "default_sink"
connect = "file_json_sink"
```
